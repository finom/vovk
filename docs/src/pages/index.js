import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';


export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title} xxxxxx`}
      description="Description will go into a meta tag in <head />"
    >
      <p className={styles.main}>
        <img
          width="250"
          alt="vovk"
          src="https://github.com/finom/vovk/assets/1082083/86bfbbbb-3600-435b-a74c-c07bd0c4af4b"
        />{' '}
        <br />
        <picture>
          <source
            width="350"
            media="(prefers-color-scheme: dark)"
            srcset="https://github.com/finom/vovk/assets/1082083/35887c40-ad37-42ca-b0b3-1d3ec359b090"
          />
          <source
            width="350"
            media="(prefers-color-scheme: light)"
            srcset="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513"
          />
          <img
            width="350"
            alt="vovk"
            src="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513"
          />
        </picture>
      </p>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        Welcome to Vovk.ts documentation! It's built to help you get started as quickly as possible and dosn't contain phislisophical discussions.
      </p>
      <p className={styles.buttons}>
      <a class={styles.button} href="/docs/intro">
        <span>Getting Started</span>{' '}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          ></path>
        </svg>
      </a>
      <br /><br />
      <a href="https://vovk.dev" target="_blank">
        Website
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <a href="https://github.com/finom/vovk" target="_blank">
        Github
      </a>
      </p>
    </Layout>
  );
}
