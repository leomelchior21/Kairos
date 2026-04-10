import Head from 'next/head';
import fs from 'fs';
import path from 'path';

export default function Home({ html }) {
  return (
    <>
      <Head>
        <title>Kairos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'index.html');
  const html = fs.readFileSync(filePath, 'utf-8');
  return { props: { html } };
}
