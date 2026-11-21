import { config } from "./config";
import { BackendClient } from "./backend-client";
import { Scheduler } from "./scheduler";

// Seberapa sering agent menanyakan ulang daftar service ke backend,
// supaya service yang baru ditambah admin ikut terpantau tanpa restart agent.
const SYNC_EVERY_MS = 60_000;

// async function main()  ini titik mulai program. Dipakai async
// karena nanti di langkah berikutnya kita akan menambahkan
// pemanggilan jaringan (HTTP) yang sifatnya menunggu, bukan langsung selesai.

async function main() {
    console.log(`Agent Skeleton Jalan, Terhubung ke ${config.backendUrl}`);

    const scheduler = new Scheduler(new BackendClient());
    await scheduler.sync();
    const syncTimer = setInterval(() => scheduler.sync(), SYNC_EVERY_MS);

  // Ctrl+C: hentikan semua timer dengan rapi.
    process.on("SIGINT", () => {
        clearInterval(syncTimer);
        scheduler.stop();
        process.exit(0);
    });
}

// Baris ini yang benar-benar menjalankan fungsi main() di atas.
// Tanpa baris ini, fungsinya cuma didefinisikan tapi tidak pernah dipanggil.
main();