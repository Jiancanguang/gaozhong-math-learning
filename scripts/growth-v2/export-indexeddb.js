(async () => {
  const DB_NAME = 'zhuxue_v2';
  const STORE_NAMES = ['students', 'lessons', 'records', 'exams', 'exam_scores'];

  function openDatabase(name) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function readAll(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  try {
    const db = await openDatabase(DB_NAME);
    const exportPayload = {};
    const summary = {};

    for (const storeName of STORE_NAMES) {
      const rows = await readAll(db, storeName);
      exportPayload[storeName] = rows;
      summary[storeName] = rows.length;
      downloadJson(`${storeName}.json`, rows);
    }

    downloadJson('manifest.json', {
      exportedAt: new Date().toISOString(),
      databaseName: DB_NAME,
      stores: summary
    });

    console.table(summary);
    console.log('IndexedDB export completed.', exportPayload);
    alert('IndexedDB export completed. JSON files should start downloading now.');
  } catch (error) {
    console.error('IndexedDB export failed:', error);
    alert('IndexedDB export failed. Check the console for details.');
  }
})();

