"""Package the isolated provisional preview, never the accepted application."""
from pathlib import Path
import json,hashlib,subprocess,zipfile,os
root=Path(__file__).resolve().parents[1]
directory=root/'docs/beta'
expected={'index.html','beta.css','beta.js','core.js','civics.js','sources.js','sw.js'}
if set(p.name for p in directory.iterdir())!=expected or any(not p.is_file() or p.is_symlink() for p in directory.iterdir()):
    raise SystemExit('Unexpected beta files; stopped.')
files={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(directory.iterdir())}
evidence=root/'.workbuddy-ai'/os.environ.get('NECTA_BETA_EVIDENCE_SUBDIR','beta-evidence')/'report.json'
report=json.loads(evidence.read_text(encoding='utf8'))
sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
dirty=subprocess.check_output(['git','status','--porcelain','--untracked-files=no'],cwd=root,text=True).strip()
if dirty or not report.get('exact_commit') or not report.get('stable_inputs') or report.get('tested_commit')!=sha:
    raise SystemExit('Beta requires a clean exact tested commit.')
if report['tested_files']!=files or report.get('errors') or not report['checks'] or not all(c['pass'] for c in report['checks']):
    raise SystemExit('Beta checks or fingerprints do not match.')
out=root/'.workbuddy-ai'/os.environ.get('NECTA_BETA_RELEASE_SUBDIR','beta-release');out.mkdir(parents=True,exist_ok=True)
archive=out/'necta-rescue-emergency-beta.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
    for name in files:z.writestr(name,(directory/name).read_bytes())
with zipfile.ZipFile(archive) as z:
    assert set(z.namelist())==expected
    assert all(hashlib.sha256(z.read(name)).hexdigest()==value for name,value in files.items())
manifest={'source_commit':sha,'label':'PROVISIONAL EMERGENCY BETA','public_file_sha256':files,
          'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'executed_checks':len(report['checks']),
          'human_academic_acceptance':'PENDING','physical_android':'PENDING','accepted_root_app':'unchanged 79044ec',
          'excluded_authored_cards':['concept-democracy-state','concept-democracy-reasons']}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print(json.dumps(manifest,indent=2))
