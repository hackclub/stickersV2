# stickers

make projects. get stickers.

## stack

- **SvelteKit** - framework
- **Drizzle ORM** - db management
- **Three.js** - WebGL sticker renderer

## instructions

i lowkey don't even know how this works because Alice and Euan set it up for me, so like, experiment a little?

### dev

```bash
bun install
bun run db:start -d
bun run db:push
bun run dev
```

to stop (deletes all volumes stemmed from this compose, -v includes named ones):

```bash
docker compose down -v
```

### deploy

```bash
docker compose up
```
