# Collegare Supabase (una volta sola, 10 minuti)

Supabase è l'archivio dove stanno i capi, le foto e il login del pannello (`/admin/`). È gratuito per un'attività come la vostra.

1. **Crea l'account** su https://supabase.com (con GitHub o con email) e premi **New project**.
   - Nome: `mastrosimini`
   - Regione: **Central EU (Frankfurt)**
   - Piano: **Free**
   - Scegli una password del database e conservala in un posto sicuro (non serve al sito).
2. **Crea le tabelle.** Menu **SQL Editor → New query**. Apri il file `supabase/schema.sql` (qui nel repo), copia tutto, incolla e premi **Run**.
3. **Crea il tuo utente (email e password).** Menu **Authentication → Users → Add user → Create new user**: scrivi la tua email,
   scegli una password e lascia attivo **Auto Confirm User**. Poi **Create user**. È con questa email e questa password che entri nel pannello.
4. **Dì chi può entrare.** Nella stessa pagina SQL, nuova query:
   ```sql
   insert into public.admins (email) values ('la-tua-email@esempio.it');
   ```
   Aggiungi una riga per ogni persona che deve usare il pannello (per esempio tuo padre).
5. **Indirizzi di ritorno del link email** (serve solo se usi "link via email"). Menu **Authentication → URL Configuration**:
   - *Site URL*: `https://mastrosiminishop.it/`
   - *Redirect URLs*, aggiungi: `https://mastrosiminishop.it/admin/` e `http://localhost:3000/admin/`
6. **Passami i due valori pubblici.** Pulsante **Connect** in alto: copia **Project URL** e la chiave **publishable**. Sono pensati per stare nel sito: puoi mandarmeli in chat.
   **Non mandare mai la chiave `service_role`.**

Dopo, io li metto in `.env.local`, ripubblico il sito e il pannello passa da "Modalità prova" ai capi veri.

## Come funziona la sicurezza

- Il pubblico può **leggere solo** i capi pubblicati o venduti, e le loro foto.
- Per scrivere (aggiungere, cambiare, cancellare) bisogna aver fatto il login con una email presente nella tabella `admins`.
- Il login è con email e password (in alternativa, un link via email).
