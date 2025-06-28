import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <h1>Crickview</h1>
          <p>You&apos;s truely only Live Criketing App</p>
        </div>
      </main>
    </div>
  );
}
