"""Package only the tested public bundle. This command never deploys or changes Git."""
import hashlib
import json
import subprocess
import os
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
docs = root / 'docs'
out = root / '.workbuddy-ai' / os.environ.get('NECTA_RELEASE_SUBDIR', 'release')
out.mkdir(parents=True, exist_ok=True)
sha = lambda value: hashlib.sha256(value).hexdigest()
files = {p.name: sha(p.read_bytes()) for p in sorted(docs.iterdir()) if p.is_file()}
expected = {'.nojekyll', 'index.html', 'paper-practice.html', 'paper-practice.js',
            'learning.js', 'learning-core.js', 'learning.css', 'civics-content.js',
            'sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'}
if set(files) != expected or any(p.is_symlink() or p.is_dir() for p in docs.iterdir()):
    raise SystemExit('Unexpected public files. Release packaging stopped.')
evidence_path = root / '.workbuddy-ai' / os.environ.get('NECTA_EVIDENCE_SUBDIR', 'browser-evidence') / 'report.json'
evidence = json.loads(evidence_path.read_text(encoding='utf8'))
if not evidence['checks'] or not all(c['pass'] for c in evidence['checks']) or evidence['errors']:
    raise SystemExit('The browser suite has not passed. Release packaging stopped.')
if evidence.get('tested_files') != files:
    raise SystemExit('Public files changed after the browser tests. Rerun the suite before packaging.')
candidate_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
if not evidence.get('exact_commit') or not evidence.get('stable_inputs') or evidence.get('tested_commit') != candidate_sha:
    raise SystemExit('Browser evidence is not bound to this exact clean candidate commit.')
if subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=no'], cwd=root, text=True).strip():
    raise SystemExit('Tracked worktree changes prevent exact-commit packaging.')
subprocess.run(['node', '--test'] + [str(p) for p in sorted((root / 'tests').glob('*.test.cjs'))], cwd=root, check=True)

device_path = root / '.workbuddy-ai/device-evidence/report.json'
device = json.loads(device_path.read_text(encoding='utf8')) if device_path.exists() else None
device_matches = bool(device and device.get('tested_files') == files and device['checks'] and all(c['pass'] for c in device['checks']))
archive = out / 'necta-rescue-civics-release.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name in files:
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, (docs / name).read_bytes())
with zipfile.ZipFile(archive) as z:
    assert set(z.namelist()) == expected
    assert all(sha(z.read(name)) == value for name, value in files.items())
manifest = {
    'source_commit': candidate_sha,
    'working_tree_changed': bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True).strip()),
    'archive': archive.name, 'archive_sha256': sha(archive.read_bytes()),
    'file_count': len(files), 'public_file_sha256': files,
    'browser_checks_passed': len(evidence['checks']), 'browser': evidence.get('browser'),
    'physical_android_checks_passed': len(device['checks']) if device_matches else None,
    'physical_android_device': device.get('model') if device_matches else None,
    'owner_release_approval': 'pending', 'deployed': False,
    'pending_subject_review': ['C-02', 'C-08'],
    'exact_commit_browser_evidence': True,
}
(out / 'release-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8', newline='\n')
print('Prepared ' + archive.name + ': ' + str(len(files)) + ' explicit public files')
print('SHA-256: ' + manifest['archive_sha256'])
print('No merge or deployment performed.')
