# ALBANI Avvocati - sito web

Sito statico multipagina. Nessuna dipendenza esterna: font, script (GSAP) e immagini sono tutti in `assets/`.

## Pubblicazione
Carica l'intero contenuto della cartella nella root del dominio.

- **Apache (hosting classico):** `.htaccess` attiva HTTPS forzato, HSTS, Content Security Policy e le altre intestazioni di sicurezza.
- **Netlify / Cloudflare Pages:** usa `_headers`. **Vercel:** usa `vercel.json`.

## Da completare prima di andare online
Cerca nel codice la classe `todo` (testo evidenziato in giallo sulle pagine):

1. P. IVA (footer, privacy policy, note legali)
2. PEC (privacy policy, note legali)
3. Ordine di appartenenza e numero di iscrizione dei professionisti (note legali)
4. Estremi della polizza RC professionale (note legali)
5. Fornitore di hosting e di posta (privacy policy)
6. Indirizzi e recapiti delle sedi di Milano e Napoli (contatti)
7. Ritratti dei founding partners (ora sostituiti da monogrammi, pagina professionisti)

Verifica inoltre il dominio canonico: è impostato `https://www.studiolegalealbani.com` (meta canonical, sitemap, robots, security.txt, send.php).

## Modulo di contatto
Di default il modulo convalida i dati e apre il programma di posta dell'utente con il messaggio precompilato (nessun server necessario).
Per l'invio diretto dal sito: in `contatti.html` imposta `data-endpoint="send.php"` sul tag `<form>`. `send.php` richiede PHP 8 e una casella mittente del dominio; va provato sull'hosting reale prima della messa online.

## Animazioni
- Costruzione del logo all'apertura della home (una volta per sessione, con pulsante "Salta l'animazione").
- La sirena si ridisegna nella pagina Identità.
- Tutte le animazioni si disattivano con "riduci movimento" del sistema operativo.

## Testi
I testi forniti dallo studio sono riportati integralmente. Sono stati aggiunti, e vanno validati dallo studio: descrizioni brevi delle 14 aree, sezioni "Dalla prima analisi alla tutela" e "Come si traduce in pratica", domande frequenti, pagine legali (privacy, cookie, note legali, sicurezza).
