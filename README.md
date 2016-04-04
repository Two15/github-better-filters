# Github Better Filters

Save your favorite filters when searching in github repos (Chrome and Firefox extension)

## Supported Browsers

* Chrome
* Firefox

## Development

```bash
$ npm run dev
```

The built extensions are located in `/build`.

## Distribution

Once the changes are in-place and ready for distribution:

1. Update all `/vendor` package file with new version (`manifest.json`, `package.json`, `Settings.plist`).
2. Update `/vendor` browser file if necessary.
3. Run `dist`.

```bash
$ npm run build
```

The `/dist` folder will contain ready to dist packages.

# License

MIT - Xavier Cambar _(contact email is easy to find)_
