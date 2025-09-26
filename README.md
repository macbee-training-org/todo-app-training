# Todo App Training

このプロジェクトは研修用のTodoアプリケーションです。
Turbo Repo、Hono.js、Next.js、Drizzle等を使用したモダンなWeb開発の習得を目的としています。

## 技術スタック
- **ORM**: Drizzle
- **Build Manager**: Turbo Repo  
- **Package Manager**: Bun
- **UI**: shadcn + Tailwind
- **Web Framework**: Next.js
- **API Framework**: Hono.js

## プロジェクト構成

```
./apps
├── server ... API関連のソースコード (Hono.js)
└── web ... web関連のソースコード (Next.js)

./packages
├── eslint-config ... 共通のeslint設定
├── typescript-config ... 共通のtypescript設定
└── ui ... shadcnのライブラリ
```

## 開発コマンド

```bash
# 全ての開発サーバーを起動
bun run dev

# 特定のアプリのみ起動
bun run dev --filter=web    # フロントエンドのみ
bun run dev --filter=server # APIサーバーのみ

# ビルド
bun run build

# リント
bun run lint
```

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```
