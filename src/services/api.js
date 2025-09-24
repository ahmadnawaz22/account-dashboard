// src/services/api.js

const SHEET_ID = "1Jou4tozx0mLdkq-ilTTelTEQsosURKGrP7S0L42UrgQ";
const API_KEY = "AIzaSyA_RmkDREm0WgtS3DHV8gUuWc9FKcYtLyE";

/**
 * Get all sheet tab names
 */
export async function getSheetTabs() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json.sheets) return [];
  return json.sheets.map((s) => s.properties.title);
}

/**
 * Fetch one sheet tab by name
 */
async function fetchSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    sheetName
  )}!A:AZ?key=${API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.values) return [];

  const headers = json.values[0];
  return json.values.slice(1).map((row) => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || null;
    });
    return obj;
  });
}

/**
 * Fetch all sheet tabs and return as object { tabName: rows }
 */
export async function fetchAllSheets() {
  const tabs = await getSheetTabs();
  const results = {};

  for (const tab of tabs) {
    results[tab] = await fetchSheet(tab);
  }

  return results;
}
