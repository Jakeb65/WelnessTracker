const API_URL = 'http://192.168.0.130:3000'; // lub Twój adres backendu

export async function getEntries() {
  const res = await fetch(`${API_URL}/entries`);
  return res.json();
}

export async function getEntry(id: number) {
  const res = await fetch(`${API_URL}/entries/${id}`);
  return res.json();
}

export async function addEntry(entry: any) {
  const res = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function updateEntry(id: number, entry: any) {
  const res = await fetch(`${API_URL}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function deleteEntry(id: number) {
  const res = await fetch(`${API_URL}/entries/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}