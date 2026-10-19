// Python keywords, Python takes none of them as a module name
const PYTHON_KEYWORDS = new Set(
  `False None True and as assert async await break class continue def del elif else except finally for from global if
  import in is lambda nonlocal not or pass raise return try while with yield`.split(/\s+/)
);

// Python and Rust keywords, neither language takes one as a module or package name
const KEYWORDS = new Set([
  ...PYTHON_KEYWORDS,
  ...`abstract become box const crate do dyn enum extern false final fn gen impl let loop macro match mod move mut
  override priv pub ref self Self static struct super trait true type typeof unsafe unsized use virtual
  where`.split(/\s+/),
]);

// a valid Python import name and Cargo package name: "@acme/web-app" becomes "acme_web_app"
export function toUnderscoredPackageName(name: string | undefined): string {
  const underscored = name?.replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '_') || 'my_package_name';
  if (/^\d/.test(underscored)) return `pkg_${underscored}`;
  return KEYWORDS.has(underscored) ? `${underscored}_pkg` : underscored;
}

// the name Python imports a py_name by: one it can import stays as it is, a Rust keyword too;
// any other is made valid as an npm name is, "acme-client" becomes "acme_client"
export function toPythonPackageName(name: string): string {
  return /^[\p{XID_Start}_]\p{XID_Continue}*$/u.test(name) && !PYTHON_KEYWORDS.has(name)
    ? name
    : toUnderscoredPackageName(name);
}
