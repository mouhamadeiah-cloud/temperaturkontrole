// app.js - Gemeinsame Funktionen für Primel Eiscafé

// ==================== SERVICE WORKER REGISTRIERUNG ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registriert:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker Fehler:', error);
            });
    });
}

// ==================== DATUMSFUNKTIONEN ====================
function getCurrentDate() {
    const today = new Date();
    return {
        year: today.getFullYear(),
        month: String(today.getMonth() + 1).padStart(2, '0'),
        day: String(today.getDate()).padStart(2, '0'),
        formatted: `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
    };
}

function getMonthName(month) {
    const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[parseInt(month) - 1];
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getWeekday(date) {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
}

// ==================== LOCALSTORAGE FUNKTIONEN ====================
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        return false;
    }
}

function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        return null;
    }
}

function removeData(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        return false;
    }
}

function clearAllData() {
    if (confirm('Alle gespeicherten Daten löschen?')) {
        localStorage.clear();
        alert('Alle Daten wurden gelöscht');
        location.reload();
    }
}

// ==================== EXPORT FUNKTIONEN ====================
function exportToCSV(data, filename) {
    let csvContent = '';
    
    if (Array.isArray(data)) {
        // Wenn es ein Array ist (für Tabellen)
        csvContent = data.map(row => 
            row.map(cell => {
                if (typeof cell === 'string' && cell.includes(',')) {
                    return `"${cell}"`;
                }
                return cell;
            }).join(',')
        ).join('\n');
    } else {
        // Wenn es ein Objekt ist
        csvContent = Object.keys(data).map(key => 
            `${key},${data[key]}`
        ).join('\n');
    }
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.json');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== IMPORT FUNKTIONEN ====================
function importFromJSON(file, callback) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    };
    
    reader.onerror = (error) => {
        callback(error, null);
    };
    
    reader.readAsText(file);
}

function importFromCSV(file, callback) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
        try {
            const lines = event.target.result.split('\n');
            const data = lines.map(line => 
                line.split(',').map(cell => 
                    cell.startsWith('"') && cell.endsWith('"') ? cell.slice(1, -1) : cell
                )
            );
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    };
    
    reader.onerror = (error) => {
        callback(error, null);
    };
    
    reader.readAsText(file);
}

// ==================== UI FUNKTIONEN ====================
function showAlert(message, type = 'success', duration = 3000) {
    const alert = document.getElementById('alert') || createAlert();
    
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, duration);
}

function createAlert() {
    const alert = document.createElement('div');
    alert.id = 'alert';
    alert.className = 'alert';
    document.body.appendChild(alert);
    return alert;
}

function showConfirm(message, onConfirm, onCancel) {
    if (confirm(message)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}

function showPrompt(message, defaultValue, onConfirm, onCancel) {
    const result = prompt(message, defaultValue);
    if (result !== null) {
        if (onConfirm) onConfirm(result);
    } else {
        if (onCancel) onCancel();
    }
}

// ==================== DATUMSVERGLEICH ====================
function isDatePast(year, month, day, compareDate = new Date()) {
    const date = new Date(year, month - 1, day);
    const compare = new Date(
        compareDate.getFullYear(),
        compareDate.getMonth(),
        compareDate.getDate()
    );
    return date < compare;
}

function isDateToday(year, month, day, compareDate = new Date()) {
    return year === compareDate.getFullYear() &&
           month === compareDate.getMonth() + 1 &&
           day === compareDate.getDate();
}

function isDateFuture(year, month, day, compareDate = new Date()) {
    const date = new Date(year, month - 1, day);
    const compare = new Date(
        compareDate.getFullYear(),
        compareDate.getMonth(),
        compareDate.getDate()
    );
    return date > compare;
}

// ==================== ZEITÜBERWACHUNG ====================
let timeCheckInterval = null;

function startTimeCheck(callback, interval = 60000) {
    if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
    }
    
    // Sofort prüfen
    if (callback) callback();
    
    // Dann alle interval Millisekunden
    timeCheckInterval = setInterval(() => {
        if (callback) callback();
    }, interval);
}

function stopTimeCheck() {
    if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
        timeCheckInterval = null;
    }
}

// ==================== DRUCKFUNKTIONEN ====================
function printPage() {
    window.print();
}

function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const originalTitle = document.title;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Drucken</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 1cm; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 4px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${element.outerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// ==================== EXPORT NACH EXCEL ====================
function exportToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let html = table.outerHTML;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.xls');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== THEME FUNKTIONEN ====================
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// ==================== INITIALISIERUNG ====================
document.addEventListener('DOMContentLoaded', () => {
    // Theme laden
    loadTheme();
    
    // Alert Container erstellen falls nicht vorhanden
    if (!document.getElementById('alert')) {
        createAlert();
    }
    
    console.log('✅ app.js geladen');
});

// ==================== ALLERGENE DATEN ====================
const ALLERGENE = {
    GLUTEN: 1,
    SCHALENFRUECHTE: 2,
    FISCH: 3,
    EIER: 4,
    KREBSTIERE: 5,
    WEICHTIERE: 6,
    ERDNUESSE: 7,
    SESAM: 8,
    SOJA: 9,
    LUPINE: 10,
    SELLERIE: 11,
    SENF: 12,
    MILCH_LAKTOSE: 13,
    SULFITE: 14,
    ZUSATZSTOFFE: 15
};

// ==================== ZUSATZSTOFFE BESCHREIBUNGEN ====================
const ZUSATZSTOFFE_BESCHREIBUNGEN = {
    1: 'mit Farbstoff',
    2: 'mit Konservierungsstoffen',
    3: 'Nitratpökelsalz',
    4: 'mit Antioxidationsmittel',
    5: 'mit Geschmacksverstärker',
    6: 'geschwefelt',
    7: 'geschwärzt',
    8: 'gewachst',
    9: 'mit Phosphat',
    10: 'mit Süßungsmitteln',
    11: 'mit Milcheiweiß',
    12: 'koffeinhaltig',
    13: 'alkoholhaltig',
    14: 'chininhaltig',
    15: 'enthält eine Phenylalaninquelle'
};

// ==================== ALLERGENE NAMEN ====================
const ALLERGENE_NAMEN = {
    1: 'Gluten',
    2: 'Schalenfrüchte',
    3: 'Fisch',
    4: 'Eier',
    5: 'Krebstiere',
    6: 'Weichtiere',
    7: 'Erdnüsse',
    8: 'Sesam',
    9: 'Soja',
    10: 'Lupine',
    11: 'Sellerie',
    12: 'Senf',
    13: 'Milch & Laktose',
    14: 'Sulfite',
    15: 'Zusatzstoffe'
};