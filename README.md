# Tycoon API
Inspired by roblox tycoon games this is an api made so you can learn how to use and call API's through the example of playing a superhero or supervillain tycoon game. For database we are using a json database since its meant to be run locally however migrating with buns native sqlite should be really easy tbh.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/whirlxd/tycoonapi.git
    cd tycoonapi
    ```

2. Install dependencies:

    ``` bun install```

3. Start the server:
    ```bash
    bun --watch index.ts
    ```

## Usage 
 You can call the endpoints using curl or postman. The documentation for the endpoints can be found in the [API Endpoints](docs.md) section.
 For example the example curl commands can be found in [examples.md](examples.md)


To run the tests, use the following command:
```bash
bun test
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
