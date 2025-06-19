[ Work in Progress. More shops will be added. ]

This project is an automatic restock notifier for products on voostore.com. It monitors selected products and notifies you via email as soon as your desired size is back in stock.

## Features

- Monitor any number of products and sizes
- Sends an email when your desired size is available
- Checks stock every hour (cron job)

## Requirements

- Node.js (recommended: >=23.6 for TS support)
- Gmail account for sending emails (or adjust the email setup for your provider)

## Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd restock-notifier
   ```
2. Install dependencies:
   ```sh
   npm i
   ```
3. Create a `.env` file in the `backend` directory with the following content:

   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_RECIPIENT=recipient@email.com
   ```

   > Tip: For Gmail, you need an app password if 2FA is enabled.

4. Add products and sizes to `items.json`:

   ```json
   [
     {
       "url": "https://voostore.com/products/x-jjjjound-gel-kayano-14-sneaker-in-white-black",
       "targetSize": "10 (US M)",
       "name": "Asics Kayano 14 JJJJound"
     }
   ]
   ```

   > Tip: Add items.json to .gitignore and upload your items.json directly to the deployment platform.

## Usage

Start the notifier:

```sh
node server.ts
```

- On start, it checks immediately, then in a set time interval.
- If your size is available, you will receive an email.

## Customization

- You can change the check frequency in `index.ts` (cron syntax).
- For other email providers, adjust the setup in `emailer.ts`.

## License

MIT
