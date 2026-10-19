import os
import unittest
import generated_python_client.src.test_generated_python_client as package
from readme_check import check_readme

README = os.path.join(os.path.dirname(__file__), 'generated_python_client', 'README.md')


class TestReadmeSamples(unittest.TestCase):
    def test_every_sample_calls_its_method_with_what_it_takes(self) -> None:
        with open(README, encoding='utf-8') as file:
            problems = check_readme(file.read(), package)
        self.assertFalse(problems, '\n' + '\n'.join(problems))


if __name__ == "__main__":
    unittest.main()
