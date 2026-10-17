import { toUnderscoredPackageName } from 'vovk/internal';

// Python keywords, Python takes none of them as a module name
const PYTHON_KEYWORDS = new Set(
  `False None True and as assert async await break class continue def del elif else except finally for from global if
  import in is lambda nonlocal not or pass raise return try while with yield`.split(/\s+/)
);

// the name Python imports a py_name by, as vovk's code samples have it: one it can import stays as it is,
// a Rust keyword too; any other is made valid as an npm name is, "acme-client" becomes "acme_client"
export function toPythonPackageName(name: string): string {
  return /^[\p{XID_Start}_]\p{XID_Continue}*$/u.test(name) && !PYTHON_KEYWORDS.has(name)
    ? name
    : toUnderscoredPackageName(name);
}
