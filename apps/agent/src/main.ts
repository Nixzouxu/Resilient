import { config } from "./config";

// async function main()  ini titik mulai program. Dipakai async
// karena nanti di langkah berikutnya kita akan menambahkan
// pemanggilan jaringan (HTTP) yang sifatnya menunggu, bukan langsung selesai.

async function main() {
    console.log(`Agent Skeleton Jalan, Terhubung ke ${config.backendUrl}`);
}

// Baris ini yang benar-benar menjalankan fungsi main() di atas.
// Tanpa baris ini, fungsinya cuma didefinisikan tapi tidak pernah dipanggil.
main();