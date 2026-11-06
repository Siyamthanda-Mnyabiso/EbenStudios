# Eben Studios

An online streetwear store for Eben Studios, a brand from Woodstock, Cape Town. Customers browse products by category, pick a size and colour, check out and pay with a test card. Admins manage products, stock and orders from a dashboard.

**Live site:** https://eben-studios.vercel.app

- **Frontend:** React 19, Vite, React Router, Tailwind CSS
- **Backend:** Supabase (Postgres database, authentication, file storage, row level security)
- **Hosting:** Vercel

---

## Running it on your computer

There are two ways to run it:

| | Option A: quick start | Option B: fully local |
|---|---|---|
| Database | The project's live Supabase database | A private copy running in Docker on your machine |
| You need | Node.js | Node.js, Docker Desktop and the Supabase CLI |
| Setup time | About 2 minutes | About 10 minutes, mostly the first Docker download |
| Admin access | Use the admin login provided by the student | You create your own admin account |

### Requirements

- **Node.js 20.19 or newer** (Node 22 LTS is recommended). Check with `node -v`.
- **Option B only:**
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/), installed and running
  - the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started): `brew install supabase/tap/supabase` on macOS, or prefix the commands below with `npx`

### Get the code

```bash
git clone https://github.com/Siyamthanda-Mnyabiso/EbenStudios.git
cd EbenStudios/frontend
npm install
```

---

### Option A: quick start (uses the live database)

The live project's public settings are already in `frontend/.env.production`. Copy them into a `.env` file so the development server uses them too, then start it:

```bash
cp .env.production .env
npm run dev
```

Open **http://localhost:5173**. The shop should load three products: White tee, Red shorts and Cap.

> These two values are public by design: the publishable key is sent to every visitor's browser anyway. What it can do is limited by the row level security rules in `supabase/migrations`. No secret keys are in the repository.

Anything you do here, such as creating an account or placing an order, is saved to the live database.

---

### Option B: fully local (your own private database)

Run these from the **repository root**, the `EbenStudios` folder, not `frontend`.

**1. Start Supabase in Docker.** This also applies every migration in `supabase/migrations` (0001 to 0008).

```bash
cd ..            # back to the EbenStudios folder if you are in frontend
supabase start
```

**2. Print the local URLs and keys.** You need the `API_URL`, `ANON_KEY` and `SERVICE_ROLE_KEY` lines.

```bash
supabase status -o env
```

**3. Create `frontend/.env`** with those values, and an admin email and password of your choice:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY from step 2>

# Used only by the seed script in step 4, never by the website
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from step 2>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose-a-password
```

**4. Add the products and your admin account, then start the site:**

```bash
cd frontend
npm run seed
npm run dev
```

Open **http://localhost:5173**, and log in as admin at **http://localhost:5173/admin/login** with the email and password from step 3.

Locally, new accounts are logged in straight away. Any emails Supabase sends can be viewed at **http://127.0.0.1:54324**.

When you are finished, run `supabase stop` from the repository root.

---

## Things to try

### As a customer
1. **Browse:** open **Shop**, or a category such as *Bottoms* on the home page. The filter buttons switch categories.
2. **Add to cart:** open a product, choose a size and colour, and add it to the cart.
3. **Check out:** go to **Cart → Go to checkout**. You are asked to log in or create an account, then brought back to checkout. Enter a delivery address and click **Continue to payment**.
4. **Pay with a test card.** No real money is involved.

   | Card number | Result |
   |---|---|
   | `4242 4242 4242 4242` | Payment succeeds and the order is marked **Paid** |
   | `4000 0000 0000 0002` | Card is declined |

   Use any name, any future expiry date (e.g. `12/30`) and any 3-digit security code.
5. **Order history:** **Orders** shows your orders and their status. Unpaid orders have a **Pay now** link.

### As an admin
Log in at `/admin/login`. While browsing the store as an admin, use the **Admin** button in the header, or the bar at the top on a phone, to return to the dashboard.

- **Dashboard:** revenue, order, customer and product totals, the latest orders, and an **Add product** button.
- **Products:**
  - Add or edit products: name, price, stock, category, sizes, colours, tag and photo. Large phone photos are resized automatically.
  - Deleting a product that has been ordered **archives** it instead. It disappears from the shop but stays in past orders, and can be restored.
- **Orders:**
  - Change an order's status.
  - Open **Details** to see the items, sizes, delivery address and customer email.
  - Cancelling an order puts its stock back automatically.

---

## Project structure

```
EbenStudios/
├── frontend/                    React app (Vite)
│   ├── src/
│   │   ├── pages/               Store pages, plus pages/admin for the dashboard
│   │   ├── components/          Layout, product, home and UI components
│   │   ├── context/, hooks/     Auth and cart state
│   │   ├── service/             Supabase calls (auth, products, orders)
│   │   └── lib/                 Helpers: categories, cart checks, test cards, images
│   ├── scripts/seed.mjs         Creates the admin account and starting products
│   ├── .env.example             Template for local settings
│   ├── .env.production          Public settings for the live database
│   └── vercel.json              Lets page refreshes work on Vercel
└── supabase/
    ├── config.toml              Local Supabase settings
    └── migrations/              Database schema, security rules and functions
```

### How the database keeps things safe

- **Row level security:** customers can only read their own profile and orders. Only admins can change products or order statuses.
- **Orders are created by a database function** (`create_order`). Prices, stock checks and totals are worked out in the database, never trusted from the browser, and two people cannot buy the last item at the same time.
- **Database rules handle the admin side effects:**
  - deleting a product that has been ordered archives it instead (`delete_product`)
  - marking a test payment as paid (`pay_order`)
  - returning stock when an order is cancelled (a trigger on `orders`)

## Useful commands

Run these inside `frontend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server at http://localhost:5173 |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with ESLint |
| `npm run seed` | Create the admin account and starting products (needs the keys in `.env`) |

## Troubleshooting

- **A red bar says "The shop is not connected to its database yet":** `frontend/.env` is missing or empty. Follow step A or step 3 of option B, then **restart** `npm run dev`, because Vite only reads `.env` when it starts.
- **`supabase start` says a port is already allocated:** another local Supabase project is running. Stop it with `supabase stop` in that project's folder, or run `docker ps` to see what is using port 54321.
- **`npm run dev` fails on an old Node version:** upgrade to Node 20.19+ or 22+.
- **"This account does not have admin access":** the account is a customer. Use the admin login from option B, step 3, or ask the student for the admin login for the live site.

## Notes

- **Payments are simulated.** The card form only checks test numbers in the browser and never sends card details anywhere. A real store would use a payment provider such as PayFast or Yoco.
- The newsletter sign-up on the home page is for display only and does not store emails.
