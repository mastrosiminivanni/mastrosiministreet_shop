# Collegare Supabase (una volta sola, 10 minuti)

Supabase è l'archivio dove stanno i capi, le foto e il login del pannello (`/admin/`). È gratuito per un'attività come la vostra.

1. **Crea l'account** su https://supabase.com (con GitHub o con email) e premi **New project**.
   - Nome: `mastrosimini`
   - Regione: **Central EU (Frankfurt)**
   - Piano: **Free**
   - Scegli una password del database e conservala in un posto sicuro (non serve al sito).
2. **Crea le tabelle.** Menu **SQL Editor → New query**. Apri il file `supabase/schema.sql` (qui nel repo), copia tutto, incolla e premi **Run**.
3. **Dì chi può entrare.** Nella stessa pagina SQL, nuova query:
   ```sql
   insert into public.admins (email) values ('la-tua-email@esempio.it');
   ```
   Aggiungi una riga per ogni persona che deve usare il pannello (per esempio tuo padre).
4. **Indirizzi di ritorno del link email.** Menu **Authentication → URL Configuration**:
   - *Site URL*: `https://mastrosiminivanni.github.io/mastrosiministreet_shop/`
   - *Redirect URLs*, aggiungi: `https://mastrosiminivanni.github.io/mastrosiministreet_shop/admin/` e `http://localhost:3000/admin/`
5. **Passami i due valori pubblici.** Menu **Project Settings → API**: copia **Project URL** e la chiave **anon public**. Sono pensati per stare nel sito: puoi mandarmeli in chat.
   **Non mandare mai la chiave `service_role`.**

Dopo, io li metto in `.env.local`, ripubblico il sito e il pannello passa da "Modalità prova" ai capi veri.

## Come funziona la sicurezza

- Il pubblico può **leggere solo** i capi pubblicati o venduti, e le loro foto.
- Per scrivere (aggiungere, cambiare, cancellare) bisogna aver fatto il login con una email presente nella tabella `admins`.
- Il login è con un link via email, senza password da ricordare.
