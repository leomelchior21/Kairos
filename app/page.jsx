import fs from 'fs';
import path from 'path';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'index.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
