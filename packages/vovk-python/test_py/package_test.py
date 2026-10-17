import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
import venv
import zipfile
from importlib.util import find_spec
from urllib.parse import urlsplit

PACKAGE_DIR = os.path.join(os.path.dirname(__file__), 'generated_python_client')
PACKAGE = 'test_generated_python_client'
HAS_BUILD = find_spec('build') is not None and find_spec('hatchling') is not None

# the installed package, imported from outside the source tree; the call fails validation before any request
USE_INSTALLED = f'''
import jsonschema, {PACKAGE} as package
print(package.__file__)
try:
    package.ClientSweepRPC.get_echo(query={{}}, params={{"id": "1"}})
except jsonschema.ValidationError:
    print("validated")
'''


# CI installs requirements-ci.txt, so there a missing build tool fails instead of skipping
@unittest.skipIf(not HAS_BUILD and not os.environ.get('CI'), 'build and hatchling not found: npm run install:py')
class TestPackage(unittest.TestCase):
    tmp: str
    wheel: str
    sdist: str

    @classmethod
    def setUpClass(cls) -> None:
        cls.tmp = tempfile.mkdtemp()
        # a copy, as the build writes next to the sources the other tests import
        project = shutil.copytree(
            PACKAGE_DIR, os.path.join(cls.tmp, 'project'), ignore=shutil.ignore_patterns('__pycache__', 'dist')
        )
        dist = os.path.join(cls.tmp, 'dist')
        # the sdist, then the wheel from the sdist, as the publish step in the docs builds them
        build = subprocess.run(
            [sys.executable, '-m', 'build', '--no-isolation', '--outdir', dist, project], capture_output=True, text=True
        )
        if build.returncode != 0:
            shutil.rmtree(cls.tmp, ignore_errors=True)
            raise AssertionError(build.stdout + build.stderr)
        cls.wheel = next(os.path.join(dist, name) for name in os.listdir(dist) if name.endswith('.whl'))
        cls.sdist = next(os.path.join(dist, name) for name in os.listdir(dist) if name.endswith('.tar.gz'))

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_wheel_files(self) -> None:
        with zipfile.ZipFile(self.wheel) as wheel:
            names = wheel.namelist()
        # the client reads schema.json on import; py.typed tells type checkers the package has types
        for name in ('__init__.py', 'api_client.py', 'py.typed', 'schema.json'):
            self.assertIn(f'{PACKAGE}/{name}', names)

    def test_sdist_files(self) -> None:
        with tarfile.open(self.sdist) as sdist:
            names = [name.split('/', 1)[1] for name in sdist.getnames() if '/' in name]
        for name in ('pyproject.toml', 'README.md', f'src/{PACKAGE}/py.typed', f'src/{PACKAGE}/schema.json'):
            self.assertIn(name, names)

    def test_metadata(self) -> None:
        from packaging.metadata import Metadata
        with zipfile.ZipFile(self.wheel) as wheel:
            raw = wheel.read(next(name for name in wheel.namelist() if name.endswith('.dist-info/METADATA')))
        metadata = Metadata.from_email(raw, validate=True)
        self.assertEqual(metadata.description_content_type, 'text/markdown')
        # PyPI refuses a local version and a project URL that is not http(s)
        self.assertIsNone(metadata.version.local)
        self.assertTrue(metadata.project_urls)
        for label, url in (metadata.project_urls or {}).items():
            parts = urlsplit(url)
            self.assertIn(parts.scheme, ('http', 'https'), f'{label}: {url}')
            self.assertTrue(parts.netloc, f'{label}: {url}')

    def install(self, artifact: str, *options: str) -> str:
        """Installs the artifact into a new venv and returns the venv's python."""
        env_dir = os.path.join(self.tmp, os.path.basename(artifact) + '-venv')
        # symlinks, as python -m venv makes them: a copied interpreter may not find its library
        venv.create(env_dir, with_pip=True, symlinks=os.name != 'nt')
        python = os.path.join(env_dir, 'Scripts' if os.name == 'nt' else 'bin', 'python')
        purelib = subprocess.run(
            [python, '-c', 'import sysconfig; print(sysconfig.get_path("purelib"))'],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
        # requests, jsonschema and hatchling come from this environment, with no download
        site_dirs = [path for path in sys.path if os.path.basename(path) in ('site-packages', 'dist-packages')]
        with open(os.path.join(purelib, 'test-environment.pth'), 'w', encoding='utf-8') as pth:
            pth.write('\n'.join(site_dirs))
        pip = [python, '-m', 'pip', 'install', '-q', '--disable-pip-version-check', '--no-deps', '--no-index']
        result = subprocess.run([*pip, *options, artifact], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return python

    def assert_installed_package_works(self, python: str) -> None:
        result = subprocess.run([python, '-I', '-c', USE_INSTALLED], cwd=self.tmp, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        package_file, validated = result.stdout.splitlines()
        env_dir = os.path.realpath(os.path.dirname(os.path.dirname(python)))
        self.assertEqual(os.path.commonpath([os.path.realpath(package_file), env_dir]), env_dir, package_file)
        self.assertEqual(validated, 'validated')

    def test_wheel_installs(self) -> None:
        self.assert_installed_package_works(self.install(self.wheel))

    def test_sdist_installs(self) -> None:
        self.assert_installed_package_works(self.install(self.sdist, '--no-build-isolation'))


if __name__ == "__main__":
    unittest.main()
