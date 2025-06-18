[ Work in Progress ]

This project is an automatic restock notifier for products on voostore.com. It monitors selected products and notifies you via email as soon as your desired size is back in stock.

## Features

- Monitor any number of products and sizes
- Sends an email when your desired size is available
- Checks stock every hour (cron job)
- Easy configuration via JSON and environment variables

## Requirements

- Node.js (recommended: >=18)
- Gmail account for sending emails (or adjust the email setup for your provider)

## Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd voostore-restock-notifier/backend
   ```
2. Install dependencies:
   ```sh
   npm install
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

## Usage

Start the notifier:

```sh
node server.js
```

- On start, it checks immediately, then automatically every hour.
- If your size is available, you will receive an email.

## Customization

- You can change the check frequency in `index.js` (cron syntax).
- For other email providers, adjust the setup in `emailer.js`.

## License

MIT
