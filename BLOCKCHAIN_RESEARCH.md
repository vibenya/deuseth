# DeusETH On-Chain Research

Reconstruction of the 2017–2018 DeusETH show from Ethereum mainnet data. All findings verified directly against live chain state and historical events.

## Key contracts

All deployed by `0xb8579b19da2108249d4391d73430abba665515ca` (the team deployer wallet).

| Role | Address | Deploy date | Deployer nonce |
|---|---|---|---|
| **DeusETH v1** (buggy, first release) | `0xe46b5f1f3551bd3c6b29c38babc662b03d985c48` | 2018-01-29 | 13 |
| **Randao** (victim selection) | `0xfe7e9141d1ec8d30a37f9908cd93eadd7a2d9d9b` | 2018-02-22 | 26 |
| **DeusETH v2** (show actually ran here) | `0x2c7411ecd2110b7760627880f1860646a265c5df` | 2018-03-14 | 40 |
| **StockExchange v2** | `0x5a90405495da32569a208a992a574e59a75788a2` | 2018-03-14 | 42 |
| **MigrateToNewLottery** (v1→v2) | `0x6d03c10006afaa6152193cbf8c0593686f2f08dd` | — | 57 |
| **DeusToken v3** (post-show ERC-721 relaunch) | `0xb8d1cdcefe47834971067bb0b8249f45433b4157` | 2018-04-24 | — |
| **DeusMarketplace v3** | `0x22b3f332e99d1405ea66d2285c299895faaa4974` | — | — |

Deployer created 21 contracts in total (nonces 0–69). Dec 2017 nonces 1 and 7 appear to be abandoned test deployments.

## Token ID mapping (canonical)

Verified against Kesha Seyfert's Apr 10 2018 roster + on-chain sale prices + deployer behavior. **`tokenId == character.id`** in both v2 and v3 — the mapping is stable across contracts.

```
 1 Temoto              14 Dustin              27 Teri                40 Valentine
 2 Jay                 15 Anthony             28 Emma                41 Konstanz
 3 Tracey              16 Black Hat           29 Vacio               42 Mrs. Stacey
 4 Ben                 17 Ruby                30 Boozy               43 Mrs. Strict
 5 Harold              18 Noir                31 Shannon             44 Leo
 6 Lee                 19 Mega                32 Rick                45 Beck
 7 The Eye             20 Ashley Mazel        33 Edmund the Wise     46 Silence
 8 Dr. Jonas Busch     21 Viceroy Vincent     34 Corley              47 Nao
 9 Daedalus            22 Roosevelt           35 Zergaldo            48 The Thing
10 Danko               23 Claudia             36 Kate                49 Rad
11 Lucy                24 Carlos              37 Johannes            50 Filthy King
12 Rock                25 Arnold Van Houten   38 Layla the Rightful
13 Gary                26 Narciss             39 Kesh
```

## v1 (2018-01-29) — the buggy release

- Custom contract, not ERC-721 — `cap=50`, buyers called `buyTokens(_id)` with 1 ETH to explicitly choose a character id
- Per-token state: `{ state: alive|dead, holder: address, branch: uint8 }`
- All 50 tokens were purchased before the bug hit (50 `TokenHolder` events recorded initial buys)
- Bug hit during first episode attempt → full redeploy required

## v2 (2018-03-14) — the show ran here

Same contract design as v1. The entire show history lives on this contract as `TokenState(id, state)` events.

### On-chain episode reconstruction

Cross-referenced with the narrative in `public/data/adventures.json`. Clusters identified by grouping death events into blocks < 1000 blocks apart.

| Chain ep | Date (UTC) | Deaths (count) | ids | Museum ep |
|---|---|---|---|---|
| 1 | 2018-03-16 15:37 | 3 | 13, 44, 48 | ep1 Bloody Kitties |
| 2 | 2018-03-20 18:16 | 7 | 5, 25, 27, 29, 41, 42, 45 | ep2 Wolf Party |
| 3 | 2018-03-23 20:03 | 5 | 6, 17, 32, 37, 38 | ep3 Freedom To Die |
| 4 | 2018-03-26 14:27 | 1 | 4 | ep5 Murder |
| 5 | 2018-03-30 16:20 | 14 | 3, 11, 12, 15, 19, 20, 21, 23, 28, 30, 31, 36, 43, 50 | ep6 The Final Battle |
| 6 | 2018-04-03 18:21 | 19 | 1, 2, 7, 8, 9, 10, 14, 16, 18, 22, 24, 26, 33, 34, 35, 40, 46, 47, 49 | ep7 Scam |
| — revive all — | 2018-04-06 13:30 | (50 revives) | — | ep8 Hard Fork (reborn) |
| 7 | 2018-04-11 15:39 | 45 | all except [5, 10, 11, 18, 36] | ep9 Tokencide |
| 8 | 2018-04-13 16:03 | 2 | 18, 36 | (not in museum) |

**Final on-chain alive set: `[5, 10, 11]`** = Harold, Danko, Lucy.

Note: Kesha's Apr 10 19:17 pre-episode prediction list said `[5, 13, 41, 45, 47]` would survive — that was a human guess before the Randao-seeded PRNG ran. The actual outcome was different.

Totals: 96 `TokenState(_, 0)` deaths, 99 `TokenState(_, 1)` revives. First batch of 50 revives = initial `buyTokens` calls on March 16. Second batch = Hard Fork mass-reborn on April 6.

## v1 → v2 migration

Recorded migration procedure:

1. Deploy new lottery
2. Deploy migration contract
3. Link migration to old & new lottery
4. Show aggressive migration popup
5. Wait for users to migrate
6. End old lottery (close migration + stock)
7. Enable migration-price buys on new lottery
8. Manually migrate anyone who transferred their token
9. Offer refunds to users who never used the popup
10. Close migration-price window on new lottery
11. Buy all remaining tokens for 0
12. Sweep migration contract funds into new bank
13. List team-bought tokens at 0.3 ETH

`MigrateToNewLottery.data[1..50]` on chain: all 50 entries populated (non-zero). So `fetchData()` succeeded for every id. The off-by-one bug in `allHolders()` (`for (i = 0; i < 50; i++) a[i] = data[i]`) shifts the returned array and omits `data[50]` — cosmetic, didn't affect the actual migration.

### Team-held set on v2

10 tokens whose first v2 `TokenHolder` event points to the deployer (= team bought directly at step 11 instead of going through the migration contract, meaning `migration(_id)` was never called successfully for them):

`[2, 13, 15, 17, 18, 22, 23, 29, 30, 45]`

Their fates after being listed at 0.3 ETH:

| id | name | sold by 17 Mar 12:44 | final v2 state |
|---|---|---|---|
| 15 | Anthony | ✅ 17 Mar 10:35 → `0x401e6f82` | sold |
| 18 | Noir | ✅ 16 Mar 17:07 → `0xbd2ca806` | sold |
| 30 | Boozy | ✅ 17 Mar 10:20 → `0x401e6f82` | sold |
| 22 | Roosevelt | — later 17 Mar 23:02 → `0x4d99d5c7` | sold |
| 45 | Beck | — sold & relisted multiple times | STOCK |
| 17 | Ruby | — | STOCK |
| 23 | Claudia | — | STOCK |
| 29 | Vacio | — | STOCK |
| **2** | **Jay** | — 9 relist events, team took it back | **DEPLOYER** |
| **13** | **Gary** | — 3 events, team took it back and never touched again | **DEPLOYER** |

Kesha's comment on 17 Mar 12:44 ("всего троих купили") matches the three sales above ✅ — strong corroboration that this is the correct "team-held" set.

## v3 ERC-721 (2018-04-24) — post-show relaunch

- Standard `ERC721Token` with `mint(_to, _tokenId)` — tokenId is explicit, preserving v2 ids
- 69 tokens minted: 1–50 main cast + 51–69 (specials: Foolish Teri, Bubbled Teri, Sleepy Temoto, Vitalik Buterin's Unicorn, Happy Temoto, The Bloody Eye, Danko without a hood, Meme Kesh, Trader Wolf, Mad Temoto, Johannes from the Oscars, Dead Ben, Happy Noir, Scammer Kesh, Happy Harold, CryptoHamster, Temoto the Mascot, Happy Kate, Happy Lucy)
- `tokenURI` never set — all calls return empty string (metadata was served by the old website backend, which is gone)
- v3 `owner()` = `0x1fed8ba9a9fdd72ef9038046ad148beb413491b8` (ownership was transferred from deployer at some point; private key lost — see "The Lost Key" note below)
- `deployer.balanceOf = 0` — every token was distributed

### Sales data — all three venues

**Total transfers**: 216 (69 mints + 97 on custom DeusMarketplace v3 + 50 external)

#### DeusMarketplace v3 (`0x22b3f332...`) — 2018 era

11 `Sold` events total. 8 match `museum/seed/characters.json.lastSalePrice` exactly — the remaining 3 are for specials (tokens 54, 59) or specials not tracked in museum. Every price match is exact, zero contradictions.

| id | name | date | price |
|---|---|---|---|
| 2 | Jay | 2018-05-01 | 0.1 |
| 13 | Gary | 2018-05-01 | 0.1 |
| 54 | Vitalik Buterin's Unicorn | 2018-05-20 | 0.1 |
| 17 | Ruby | 2018-05-20 | 0.1 |
| 33 | Edmund the Wise | 2018-09-18 | 0.09 |
| 59 | Trader Wolf | 2018-09-27 | 0.1 |
| 43 | Mrs. Strict | 2018-12-18 | 0.09 |
| 28 | Emma | 2019-02-23 | 0.09 |
| 29 | Vacio | 2019-02-23 | 0.1 |
| 44 | Leo | 2019-02-23 | 0.09 |
| 63 | Happy Noir | 2019-02-23 | 0.1 |

#### OpenSea — the 2021–2024 revival

13 external marketplace sales discovered via cross-referencing v3 Transfer events with OpenSea router contracts and their sale events (`OrdersMatched` on Wyvern, `OrderFulfilled` on Seaport). These were **not** visible to the museum's `lastSalePrice` field because it only reflected the custom marketplace.

| id | name | date | venue | price (ETH) |
|---|---|---|---|---|
| 1 | Temoto | 2021-08-06 | Wyvern v1 | 0.95 |
| 31 | Shannon | 2021-08-06 | Wyvern v1 | 1.00 |
| 4 | Ben | 2021-08-06 | Wyvern v1 | **1.69** |
| **13** | **Gary** | **2021-08-30** | **Wyvern v1** | **2.00** ⭐ |
| 25 | Arnold Van Houten | 2022-01-28 | Wyvern v1 | 1.00 |
| 3 | Tracey | 2022-01-28 | Wyvern v1 | 1.00 |
| 8 | Dr. Jonas Busch | 2022-01-31 | Wyvern v1 | 1.00 |
| 46 | Silence | 2022-02-04 | Wyvern v1 | 1.00 |
| 15 | Anthony | 2022-06-20 | Wyvern v2 | 0.75 |
| 30 | Boozy | 2022-08-19 | Seaport 1.1 | 0.95 |
| 62 | Dead Ben (special) | 2022-09-05 | Seaport 1.1 | 1.50 |
| 20 | Ashley Mazel | 2023-02-28 | Seaport 1.1 | (not parsed) |
| 14 | Dustin | 2024-01-15 | Seaport 1.5 | (not parsed) |

Gary (token 13) is the project's sale-price champion: sold for **0.1 ETH on the custom marketplace in 2018, then 2.0 ETH on OpenSea in 2021** — a 20× appreciation across the NFT boom.

The "direct p2p" transfers (33 of the 50 external) went straight to the v3 contract (`safeTransferFrom` called directly, no marketplace intermediary) — gifts, wallet migrations, or OTC moves.

### Special state: Gary's burn

Of all 69 v3 tokens, exactly one is at the burn address `0x000000000000000000000000000000000000dEaD`: **token 13 (Gary)**, sent there on **2024-01-01** by its holder after the 2 ETH Wyvern purchase. No actual `burn()` was called. Only token where this happened. Gary's full arc: 0.1 ETH sale (2018) → 2.0 ETH resale (2021) → ritual burn (2024-01-01).

### The Lost Key

`setTokenURI` on the v3 ERC-721 is `onlyOwner`. The owner slot currently holds `0x1fed8ba9a9fdd72ef9038046ad148beb413491b8` — a wallet whose private key has been lost. This means:

- `tokenURI(id)` returns `""` for all 69 tokens, permanently
- OpenSea / wallets cannot resolve any character metadata
- The on-chain metadata for DeusETH is unreachable forever
- No v4 migration is planned — the museum site (`DeusETH_new`) is the canonical display

## Full sales picture across all venues

Full per-token resale timeline is saved in [`src/data/token_timelines.json`](src/data/token_timelines.json) (also raw form in `token_timelines_raw.json`). 935 events total across 6 venues: v1 StockExchange, v2 StockExchange, v2 Migration contract, v3 DeusMarketplace, OpenSea Wyvern v1/v2, OpenSea Seaport 1.1–1.6.

Initial sale of every main-cast token (`buyTokens` on v1) was at **1.0 ETH** — the `rate` hardcoded in the v1 contract.

### v1 StockExchange (`0x8ab65829fb...`) — Jan 29 – Mar 6 2018

71 listings, 6 actual sales:

| date | id | name | price |
|---|---|---|---|
| 2018-01-30 | 10 | Danko | 2.0 ETH |
| 2018-02-16 | 32 | Rick | 0.7 ETH |
| 2018-02-17 | 31 | Shannon | 0.73 ETH |
| 2018-02-19 | 31 | Shannon | 0.8 ETH |
| 2018-02-20 | 13 | Gary | 0.8 ETH |
| 2018-03-05 | 43 | Mrs. Strict | 0.1 ETH |

Listings went from wildly speculative (up to **956 ETH** asked for Rock, 100 ETH for Rad, 29 ETH for Vacio) in the first days, down to realistic sub-1-ETH prices by mid-February once users realized nobody was paying those rates.

### v2 StockExchange (`0x5a90405495da...`) — Mar 16 – Apr 11 2018

76 listings, 8 sales. The 10 team-held tokens from the failed migration were all listed at 0.3 ETH; users received 0.21 ETH net after the 30% marketplace fee.

| date | id | name | price (net) |
|---|---|---|---|
| 2018-03-16 | 18 | Noir | 0.21 ETH |
| 2018-03-17 | 30 | Boozy | 0.21 ETH |
| 2018-03-17 | 15 | Anthony | 0.21 ETH |
| 2018-03-17 | 22 | Roosevelt | 0.21 ETH |
| 2018-03-19 | 45 | Beck | 0.21 ETH |
| 2018-03-23 | 41 | Konstanz | 0.07 ETH |
| 2018-03-31 | 45 | Beck | 0.21 ETH |
| 2018-04-11 | 11 | Lucy | 0.63 ETH |

### OpenSea revival — 2021–2024

13 sales total on Wyvern v1 (8), Wyvern v2 (1), Seaport 1.1 (3), Seaport 1.5 (1). Two Seaport sales were WETH-paid (not native ETH) — `OrderFulfilled` events were parsed manually to extract the consideration totals.

Top 10 v3 resales (across all venues):

| rank | id | name | price | date | venue |
|---|---|---|---|---|---|
| 1 | 13 | Gary | **2.00 ETH** | 2021-08-30 | Wyvern v1 |
| 2 | 10 | Danko | **2.00 ETH** | 2018-01-30 | v1 StockExchange |
| 3 | 20 | Ashley Mazel | 1.7325 WETH | 2023-02-28 | Seaport 1.1 |
| 4 | 4 | Ben | 1.69 ETH | 2021-08-06 | Wyvern v1 |
| 5 | 62 | Dead Ben (special) | 1.50 ETH | 2022-09-05 | Seaport 1.1 |
| 6 | 3 | Tracey | 1.00 ETH | 2022-01-28 | Wyvern v1 |
| 7 | 8 | Dr. Jonas Busch | 1.00 ETH | 2022-01-31 | Wyvern v1 |
| 8 | 25 | Arnold Van Houten | 1.00 ETH | 2022-01-28 | Wyvern v1 |
| 9 | 31 | Shannon | 1.00 ETH | 2021-08-06 | Wyvern v1 |
| 10 | 46 | Silence | 1.00 ETH | 2022-02-04 | Wyvern v1 |
| 11 | 1 | Temoto | 0.95 ETH | 2021-08-06 | Wyvern v1 |
| 12 | 30 | Boozy | 0.95 ETH | 2022-08-19 | Seaport 1.1 |

### Gary's arc — the most-traded token

Full resale history for token 13 (Gary), 2018 → 2024:

1. **2018-01-30** — Bought on v1 for **1.00 ETH** (initial `buyTokens`)
2. **2018-01-30** — Listed on v1 StockExchange at 4.0 ETH
3. **2018-02-01** — Delisted (price too high), transferred off-chain, re-listed at 0.8 ETH
4. **2018-02-20** — Sold on v1 StockExchange for **0.8 ETH** to `0x3404f61f...`
5. **2018-03-16** — Migrated to v2 (via failed `migration()`, team bought the slot directly and listed at 0.3 ETH)
6. **2018-03-27** — Delisted — team took custody when no buyer appeared
7. **2018-04-24** — Minted on v3 ERC-721 to deployer (as part of 69-token relaunch)
8. **2018-05-01** — Sold on DeusMarketplace v3 for **0.1 ETH** to `0xf8e2867d...`
9. **2021-08-30** — Resold on **OpenSea Wyvern v1 for 2.0 ETH** to `0x8f2d8527...` — the project's all-time high v3 resale
10. **2024-01-01** — **Burned**: holder sent it to `0x000000000000000000000000000000000000dEaD` as a ritual. The only v3 token at the burn address.

Gary was also flagged as one of the two "team-custody" tokens after the v2 migration failed (alongside Jay) — possibly the "lost in migration" character the team recalled, but that theory was rejected.

## Randao

`0xfe7e9141d1ec8d30a37f9908cd93eadd7a2d9d9b` (deployer nonce 26) — matches the address in the original Medium article describing how victims were picked. Confirmed via CREATE-address derivation from deployer + nonce. Commit/reveal before block 5133039 (2018-02-21 23:57 UTC), seed fed into Park-Miller PRNG to deterministically select death ids.

## Final current holdings on v2

Raw output of `allStates()` on `0x2c7411...`:

- All 50 tokens still exist, `state=1` for `[5, 10, 11]`, `state=0` for the rest (frozen at end-of-show)
- Stock exchange (`0x5a90405495da...`) currently holds 21 tokens — listings that never closed
- Deployer still holds 2: **Jay (2) and Gary (13)**
- Remaining 27 are held by the original v1-era buyers

## Data sources & methodology

- RPC: `https://ethereum-rpc.publicnode.com` (public, no key)
- Contract creation addresses derived via RLP-encoded CREATE formula (`keccak256(rlp([sender, nonce]))[12:]`) for nonces 0–120
- Identified DeusETH v0 contracts by calling `cap()` and expecting 50
- Cross-verified the buggy v1 contract by finding the one with 50 `TokenHolder` events and 0 death events
- Death sequence on v2 fetched via `eth_getLogs` for `TokenState(uint256,uint8)` topic `0xcf76a3b96c0df8c1e7e7ebc3491f0fa93a335bcb18f12a49a25e5f6b858b6a25`, clustered by block proximity
- Marketplace sales fetched via `Sold(uint256,uint256,address,address)` topic `0x55390ad3bffeff90968b8c54d2ed0099a7dbd2d71bc56263a1abf5643f833fec`
- Event topic hashes computed via `web3_sha3` RPC call (to avoid a local keccak dep)

## Useful links

- v1 contract: https://etherscan.io/address/0xe46b5f1f3551bd3c6b29c38babc662b03d985c48
- v2 contract (historically canonical): https://etherscan.io/address/0x2c7411ecd2110b7760627880f1860646a265c5df
- v3 ERC-721: https://etherscan.io/address/0xb8d1cdcefe47834971067bb0b8249f45433b4157
- Randao: https://etherscan.io/address/0xfe7e9141d1ec8d30a37f9908cd93eadd7a2d9d9b
- Migration contract: https://etherscan.io/address/0x6d03c10006afaa6152193cbf8c0593686f2f08dd
- Deployer: https://etherscan.io/address/0xb8579b19da2108249d4391d73430abba665515ca
