# Proto Project

This repository is a **project skeleton** for building applications on top of the [Proto Framework](https://github.com/protoframework/proto). It wires up Composer, your folder structure, and a minimal entrypoint so you can start writing modules and apps right away.

---

## 📦 Installation

Choose one of the two approaches:

### 1. Create a brand-new project via Composer

```bash
composer create-project protoframework/proto-project my-app
cd my-app
composer install
```

### 2. Clone & install

```bash
git clone https://github.com/protoframework/proto-project.git my-app
cd my-app
composer install
```

---

## 🏗️ Directory Layout

```text
my-app/
├─ apps/                   # Your front-end PWAs (CRM, developer UI, etc.)
├─ common/                 # Shared code (helpers, config, utilities)
├─ modules/                # Feature modules (user, product, auth, …)
├─ public/                 # HTTP entrypoints & public assets
│   └─ api/
│       └─ index.php       # Example API bootstrap
├─ composer.json
└─ vendor/
   └─ protoframework/
      └─ proto/            # The Proto Framework core (do not edit)
```

---

## ⚙️ Configuration

Your application-specific settings live in **`common/Config/.env`**. Proto reads JSON-encoded environment variables from there:

```dotenv
# common/Config/.env
{
  "APP_ENV": "dev",
}
```

---

## 🚀 Bootstrapping & Usage

All you need in your front-controller is:

```php
<?php declare(strict_types=1);

// public/api/index.php
require __DIR__ . '/../../vendor/autoload.php';

// Kick off your API router (or any other Proto component)
Proto\Api\ApiRouter::initialize();
```

Behind the scenes Composer’s autoloader handles:

* **`Proto\…`** via the core framework in `vendor/protoframework/proto`
* **`Modules\…`**, **`Common\…`**, and **`Apps\…`** via your local folders

---

## 📦 Creating a New Module

1. Make a directory under `modules/YourFeature`
2. Define your namespace in PHP files:

   ```php
   <?php declare(strict_types=1);
   namespace Modules\YourFeature\Api;

   // … your controllers, routers, etc.
   ```
3. In `modules/YourFeature/Api/api.php` register routes:

   ```php
   <?php declare(strict_types=1);
   namespace Modules\YourFeature\Api;

   use Modules\YourFeature\Controllers\FeatureController;

   router()
     ->resource('feature', FeatureController::class);
   ```

---

## 🛠️ Developer Tools

A simple admin UI at `public/developer` lets you:

* Scaffold modules, controllers, models, migrations, etc.
* Run migrations, view error logs, dispatch jobs

Just point your browser at `/developer` after `composer install`.

---

## Screenshots

![Generator Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/generator-page.png)
![Generator Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/generator-modal.png)
![Migration Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/migration-page.png)
![Error Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/error-page.png)
![Error Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/error-modal.png)
![Documentation Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/documentation-page.png)
![Users Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/user-page.png)
![IAM Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-page.png)
![IAM Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-modal.png)
![Email Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/email-page.png)

## 🤝 Contributing

1. Fork this repo
2. Create a branch (`git checkout -b feature/xyz`)
3. Make your changes, commit & push
4. Open a Pull Request against `main`
5. We’ll review & merge!

Please follow our [CONTRIBUTING.md](CONTRIBUTING.md) for code standards.

---

## 📄 License

This project is licensed under MIT. See [LICENSE](LICENSE).

---

> Build fast, stay modular, ship secure.
> — The Proto Framework Team
