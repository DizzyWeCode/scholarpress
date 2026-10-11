# Configure the public site URL

ScholarPress reads the public URL from the server environment variable:

```text
NEXT_PUBLIC_SITE_URL
```

For production, set it to the canonical HTTPS domain:

```text
NEXT_PUBLIC_SITE_URL=https://dr-fraction.me
```

Do not add a trailing slash. Do not include a path such as `/admin`.

## Where to set it in Vercel

1. Open the **Vercel dashboard**.
2. Open the ScholarPress project.
3. Go to **Settings → Environment Variables**.
4. Add or edit:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://dr-fraction.me`
   - **Environments:** select **Production**. Select **Preview** too if preview deployments should generate links to the production domain.
5. Save the variable.
6. Redeploy the latest production deployment. Environment-variable changes do not retroactively change an already-built deployment.
7. Open the deployed site and visit `/admin/settings` to confirm that **Domain and sharing → Canonical site URL** is marked **Configured**.

If the deployed domain is different, use that exact canonical domain instead. For example:

```text
NEXT_PUBLIC_SITE_URL=https://www.example.org
```

## Local development

For local development only, create `.env.local` in the repository root:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart the Next.js development server after creating or changing `.env.local`.

`.env.local` is ignored by Git and must not be committed.

## What this value controls

ScholarPress uses the value for:

- canonical page URLs;
- sitemap links;
- Open Graph and social-sharing URLs;
- absolute links included in emails;
- auth callback and redirect configuration references.

The variable is prefixed with `NEXT_PUBLIC_` because the resulting URL is public, not because it is a secret. Never put API keys, service-role keys, webhook secrets, or other credentials in this variable.

## Supabase Auth follow-up

The deployment variable alone is not enough for production authentication. In the Supabase dashboard:

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to the same canonical URL, for example:

   ```text
   https://dr-fraction.me
   ```

3. Add the production callback URL used by the application:

   ```text
   https://dr-fraction.me/auth/callback
   ```

4. Keep the local callback URL for local testing if needed:

   ```text
   http://localhost:3000/auth/callback
   ```

5. Save the settings and test passwordless sign-in on the deployed site.

Only add domains you control and intend to use. Do not add wildcard redirect URLs as a shortcut.

## Verification checklist

After redeploying:

- Visit `https://dr-fraction.me` and confirm the site loads.
- Visit `https://dr-fraction.me/sitemap.xml` and confirm it returns the production domain in its URLs.
- Visit `https://dr-fraction.me/robots.txt` and confirm it loads.
- Open a published article and inspect its canonical/share URL if needed.
- Visit `/admin/settings` and confirm the canonical URL is **Configured**.
- Test sign-in and sign-out.
- Check that email links point to the production domain.

If Settings still reports the value as incomplete, confirm that the variable was added to the correct Vercel project and environment, then trigger a new deployment.
