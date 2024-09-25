export default async function getTemplateFilesFromPackage(packageName: string, version?: string) {
  const versionSuffix = version ? `@${version}` : '';
  const apiUrl = `https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(packageName)}${versionSuffix}/flat`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch package data: ${response.statusText}`);
  }

  const data = (await response.json()) as { files?: { name: string }[] };

  if (!data.files) {
    return {};
  }

  // Filter files in the '/templates/' folder
  const templateFiles = data.files
    .filter((file) => file.name.startsWith('/templates/') && !file.name.endsWith('/') && file.name.endsWith('.ejs'))
    .map((file) => [file.name.substring('/templates/'.length), `${packageName}${file.name}`]);

  return Object.fromEntries(templateFiles) as Record<string, string>;
}
