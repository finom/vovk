// concurrently runs each command string through a shell; pinning it keeps the quoting below valid
export function getCommandShell(platform: NodeJS.Platform = process.platform) {
  return platform === 'win32' ? 'cmd.exe' : '/bin/sh';
}

export function quoteShellArgument(arg: string, platform: NodeJS.Platform = process.platform) {
  if (platform === 'win32') {
    // cmd.exe has no escape inside double quotes, a doubled quote is read as a literal one
    return /^[\w@+=:,./\\-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '""')}"`;
  }

  return /^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`;
}
