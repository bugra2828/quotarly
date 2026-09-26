# PROJECT_SPEC — AI Destekli Gazeteci Outreach & Backlink Platformu

> **Bu dosya, Antigravity içindeki AI ajanına verilecek ana proje dokümanıdır.**
> Referans alınan ürün: backlinker.ai (25 Eylül 2026'da incelendi).
> **Kural:** Referans sitenin adı, logosu, metinleri, müşteri yorumları ve görselleri **kopyalanmayacak**. Kendi markamızı ve kendi metinlerimizi kullanacağız. Aşağıda marka adı yerine `[BRAND]` yazıyor.

---

## 0. Ajan için çalışma talimatı

1. Bu dokümanı baştan sona oku. Kodlamaya **Bölüm 12'deki faz sırasına göre** başla.
2. **Seçimi yapılmış** teknolojileri (Bölüm 4) değiştirme.
3. Dokümanda **`🟡 KARAR`** işaretli bir noktaya geldiğinde **dur ve kullanıcıya seçenekleri sun**. Her seçeneğin artısını ve eksisini yaz, bir tanesini öner, kullanıcının cevabını bekle. Kendi başına seçim yapma.
4. Yeni bir API, MCP veya paket eklemen gerekirse önce kullanıcıya sor.
5. Her fazın sonunda kısa bir özet ver ve bir sonraki faza geçmek için onay iste.
6. Gizli anahtarları (API key) asla koda gömme. Hepsi `.env.local` içinde dursun, `.env.example` dosyasını da güncel tut.

---

## 1. Referans ürün analizi (backlinker.ai)

### 1.1 Ne yapıyor?
Done-for-you (DFY) bir SEO hizmeti. Gazeteciler HARO, Featured.com, Help A B2B Writer ve SOS (Source of Sources) gibi platformlarda "uzman görüşü arıyorum" diye soru yayınlıyor. Ürün bu soruları müşterinin uzmanlık alanıyla eşleştiriyor, müşterinin biyografisiyle eğitilmiş bir AI ile cevap (pitch) yazıyor ve gönderiyor. Gazeteci alıntıyı haberinde kullanırsa müşterinin sitesine yüksek otoriteli (DR 30+) bir **editoryal backlink** geliyor.

### 1.2 Tespit edilen teknik yapı (dışarıdan görünen)
| Katman | Gözlem |
|---|---|
| Frontend | Next.js (App Router, `_next/static/chunks/app/...`) |
| Auth | E-posta ile giriş (magic link) + Google OAuth. `/login` ve `/register` sayfaları var |
| Analitik | PostHog (reverse proxy `/ingest` üzerinden, session replay, dead-click, surveys), Hotjar, Google Tag Manager |
| Demo | Calendly ile demo randevusu |
| Blog | Ayrı bir subdomain (`blog.`) |
| Gönderim | FAQ'ya göre müşterinin e-postası kullanılmıyor, pitch'ler platform üzerinden gönderiliyor (FAQ'da hâlâ kapanmış olan "Connectively" platformunun adı geçiyor, yani içerik güncel değil) |

### 1.3 Sayfa ve bölüm yapısı (landing)
1. **Hero:** Ana vaat (trafik artışı + otomatik backlink), CTA'lar (Başla, Fiyatlar), güven rozetleri (memnuniyet garantisi, istediğin zaman iptal, hızlı onboarding)
2. **İstatistik şeridi:** Ulaşılan yayın sayısı, ortalama trafik artışı, müşteri sayısı, minimum DR
3. **Kanıt kartları:** Yayın adı + DR değeri + "alıntıyı gör" linki
4. **Logo şeridi:** Link alınan yayınlar
5. **Testimonial slider**
6. **Case study sekmeleri:** Müşteri seçilince trafik büyümesi, DR değişimi, link kaynakları dağılımı ve organik trafik grafiği görünüyor
7. **Nasıl çalışır:** 3 adım (Onboarding → Keşif & Eşleştirme → Otomatik Outreach)
8. **Zaman çizelgesi:** 1. hafta / 2–4. hafta / 2–3. ay / 3. ay+
9. **Fiyatlandırma:** Tek plan (300 $/ay, 150+ pitch, 3+ backlink garantisi)
10. **SSS (akordeon)**
11. **Video bölümü**
12. **Son CTA** + Footer (Terms)

### 1.4 İş modelindeki zayıf noktalar (bizim için fırsat)
- FAQ ile fiyat sayfası birbiriyle çelişiyor (bir yerde "50+ pitch" yazıyor, diğerinde "150+") ve FAQ'da kapanmış bir platformun adı geçiyor. **Biz içeriğimizi güncel ve tutarlı tutacağız.**
- Pitch'ler tam otomatik gidiyor. **Biz müşteri onayı ekleyeceğiz** (kalite ve itibar açısından avantaj).
- Tek bir plan var. **Biz 2–3 kademeli plan sunabiliriz.**
- Müşteri paneli şeffaf değil. **Biz her pitch'in ve linkin durumunu canlı gösteren bir dashboard yapacağız.**

---

## 2. Ürün tanımı ([BRAND])

**Tek cümle:** Uzmanları ve kurucuları doğru gazeteci sorularıyla eşleştiren, onların sesiyle pitch yazan, müşteri onayıyla gönderen ve kazanılan backlink'leri otomatik doğrulayıp raporlayan bir SaaS.

**Hedef pazar:** İngilizce / global (ABD ağırlıklı). SaaS, B2B, finans, pazarlama, emlak ve e-ticaret kurucuları.

**Dil:** Arayüz İngilizce. Kod yorumları İngilizce olabilir.

---

## 3. Kullanıcı rolleri

| Rol | Yetki |
|---|---|
| `client` | Kendi profilini, pitch taslaklarını, onay kuyruğunu, linklerini ve raporlarını görür |
| `admin` | Tüm müşterileri, gelen soruları, gönderim kuyruğunu ve sistem ayarlarını yönetir, pitch'leri elle düzenleyebilir |

---

## 4. Teknoloji yığını (kararlar verildi ✅)

| Katman | Seçim | Not |
|---|---|---|
| Framework | **Next.js 15+ (App Router, TypeScript)** | |
| UI | **Tailwind CSS + shadcn/ui** | Grafikler için Recharts |
| Veritabanı + Auth + Storage | **Supabase** ✅ | Postgres, RLS, magic link + Google OAuth, pg_cron |
| LLM | **Claude API** ✅ | Eşleştirme için `claude-haiku-4-5`, pitch yazma için `claude-sonnet-5` |
| Ödeme | **Lemon Squeezy veya Paddle** ✅ | Merchant of Record olduğu için Türkiye'den kullanılabiliyor. `🟡 KARAR` (Bölüm 6.4) |
| Gelen e-posta (gazeteci soruları) | **Inbound email parse** ✅ | `🟡 KARAR` (Bölüm 6.2) |
| Giden e-posta (pitch) | **Resend** ✅ | Müşteri onayından sonra verified domain üzerinden gönderim |
| SEO verisi / link doğrulama | **DataForSEO** ✅ | Backlink tespiti, domain rank, SERP |
| Hosting | **Vercel** | Next.js için en kolay seçenek |
| Arka plan işleri | `🟡 KARAR` (Bölüm 6.5) | |
| Analitik | PostHog | Ücretsiz katmanı yeterli |

---

## 5. Sistem mimarisi

```
┌──────────────────┐   bülten maili   ┌─────────────────────┐
│ HARO / SOS /     │ ───────────────▶ │ Inbound email       │
│ Help A B2B Writer│                  │ (webhook)           │
└──────────────────┘                  └──────────┬──────────┘
                                                 ▼
                                   /api/inbound (Next.js route)
                                                 │ ham mail kaydı
                                                 ▼
                            ┌────────────────────────────────────┐
                            │ 1. PARSER: Maili tek tek sorulara  │
                            │    böl (Claude Haiku, JSON çıktı)  │
                            └───────────────┬────────────────────┘
                                            ▼  queries tablosu
                            ┌────────────────────────────────────┐
                            │ 2. MATCHER: Her soru × her aktif   │
                            │    müşteri → 0–100 skor (Haiku)    │
                            └───────────────┬────────────────────┘
                                            ▼  skor ≥ eşik
                            ┌────────────────────────────────────┐
                            │ 3. WRITER: Müşterinin bio + ses    │
                            │    tonuyla pitch taslağı (Sonnet)  │
                            └───────────────┬────────────────────┘
                                            ▼  status = pending_approval
                            ┌────────────────────────────────────┐
                            │ 4. Müşteri paneli: Onayla / Düzenle│
                            │    / Reddet (+ e-posta bildirimi)  │
                            └───────────────┬────────────────────┘
                                            ▼  approved
                            ┌────────────────────────────────────┐
                            │ 5. SENDER: Resend ile gazeteciye   │
                            │    gönder (son tarihten önce)      │
                            └───────────────┬────────────────────┘
                                            ▼  sent
                            ┌────────────────────────────────────┐
                            │ 6. TRACKER (günlük cron):          │
                            │    DataForSEO + SERP ile yayını    │
                            │    ara, linki doğrula, DR kaydet   │
                            └───────────────┬────────────────────┘
                                            ▼
                               backlinks tablosu → aylık rapor
```

---

## 6. Harici servisler, API'ler ve karar noktaları

### 6.1 Claude API ✅
- **Kullanım alanları:** (a) bülten parse, (b) eşleştirme skoru, (c) pitch yazma, (d) onboarding'de siteden profil çıkarma
- **Paket:** `@anthropic-ai/sdk`
- **Modeller:** `claude-haiku-4-5` (parse ve eşleştirme, ucuz ve hızlı), `claude-sonnet-5` (pitch yazma, kaliteli)
- Structured output: Parse ve eşleştirme çıktıları JSON şemasıyla alınsın (tool use / JSON schema)
- Prompt caching: Müşterinin biyografisi ve sistem prompt'u cache'lensin (ciddi maliyet düşüşü sağlar)
- **Env:** `ANTHROPIC_API_KEY`

### 6.2 Gelen e-posta (bülten toplama) ✅ yöntem seçildi · `🟡 KARAR: sağlayıcı`
Sisteme özel bir adres (ör. `queries@in.[BRAND].com`) açılacak ve HARO, SOS ve Help A B2B Writer bültenlerine bu adresle abone olunacak.

| Seçenek | Artı | Eksi |
|---|---|---|
| **Postmark Inbound** (öneri) | Olgun bir ürün, temiz JSON webhook, güvenilir | Giden mail için ayrı bir servis gerekir |
| **Resend Inbound** | Giden mail ile aynı servis, tek panel | Daha yeni bir özellik, ajan güncel dokümanı kontrol etmeli |
| **Mailgun Routes** | Güçlü filtreleme | Arayüzü ve fiyatlandırması daha karmaşık |
| **Cloudflare Email Workers** | Ücretsiz | Kurulumu daha teknik |

- **Env (örnek):** `INBOUND_WEBHOOK_SECRET`
- Webhook imzası mutlaka doğrulanmalı.

### 6.3 Resend (giden pitch) ✅
- Pitch'ler müşteri onayından sonra gönderilecek.
- `🟡 KARAR: Gönderen kimliği`, kullanıcıya şu iki seçeneği sun:
  - (a) `jane@pitch.[BRAND].com` gibi kendi domainimizin alt adresleri, `Reply-To` olarak müşterinin gerçek e-postası (kurulumu kolay)
  - (b) Müşteri kendi domainini Resend'de doğrular ve pitch kendi adresinden gider (teslim oranı daha iyi ama müşteri için ekstra adım)
- Bildirim mailleri (onay bekleyen pitch, yeni backlink, aylık rapor) de Resend + React Email ile gönderilecek.
- **Env:** `RESEND_API_KEY`, `RESEND_FROM_DOMAIN`

### 6.4 Ödeme ✅ Merchant of Record · `🟡 KARAR: Lemon Squeezy mi, Paddle mı?`
| | Lemon Squeezy | Paddle |
|---|---|---|
| Kurulum | Çok hızlı, bireysel başvuru kolay | Onay süreci daha sıkı |
| Abonelik yönetimi | İyi | Çok iyi (B2B, faturalama) |
| Komisyon | ~%5 + 0.50 $ | ~%5 + 0.50 $ |
| MCP | Resmi yok (topluluk sürümleri var) | Resmi Paddle MCP var |

- Webhook olayları: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `payment_failed`
- **Env:** `LEMONSQUEEZY_API_KEY` + `LEMONSQUEEZY_WEBHOOK_SECRET` **veya** `PADDLE_API_KEY` + `PADDLE_WEBHOOK_SECRET`

### 6.5 Arka plan işleri · `🟡 KARAR`
Pipeline (parse → match → write → send) ve günlük link taraması için bir iş kuyruğu lazım.

| Seçenek | Artı | Eksi |
|---|---|---|
| **Inngest** (öneri) | Adım adım (step) fonksiyonlar, retry ve arayüz hazır, Vercel ile çok uyumlu | Ekstra bir servis |
| **Trigger.dev** | Uzun süren işler için iyi, güzel bir dashboard | Ekstra bir servis |
| **Supabase pg_cron + Edge Functions** | Ekstra servis gerektirmez | Retry ve izleme mantığını elle yazmak gerekir |

### 6.6 DataForSEO ✅
- **Backlinks API:** Müşteri domainine gelen yeni linkleri tespit etmek (`backlinks/backlinks/live`, `new_lost`)
- **Domain rank:** Yayının otorite skoru (DR yerine kendi "Authority Score"umuz, UI'da "DR" yerine bu ifade kullanılmalı)
- **SERP API:** Gönderilen pitch'ten sonra `"müşteri adı" + konu` araması yapıp yayını erken yakalamak
- Kullanım başı ücretli, önce sandbox ortamında test edilmeli.
- **Env:** `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`

### 6.7 Diğer
| Servis | Amaç | Env |
|---|---|---|
| Google OAuth (Supabase içinden) | "Google ile giriş" | Supabase panelinden ayarlanır |
| PostHog | Ürün analitiği | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Cal.com veya Calendly | Demo randevusu (sadece link/embed) | – |
| Firecrawl veya Jina Reader (`🟡 KARAR`, opsiyonel) | Onboarding'de müşterinin sitesini okuyup profil çıkarma | `FIRECRAWL_API_KEY` |

---

## 7. Antigravity için MCP server'lar

> Antigravity'de MCP'ler "MCP Servers" / `mcp_config.json` üzerinden eklenir. Ajan, yükleme adımlarını her MCP'nin **güncel resmi dokümanından** kontrol etmeli.

### Zorunlu
| MCP | Neden |
|---|---|
| **Supabase MCP** (resmi) | Tablo oluşturma, migration, RLS politikaları, SQL çalıştırma, TypeScript tiplerini üretme |
| **Context7** | Next.js, Supabase, Anthropic SDK, Resend gibi kütüphanelerin güncel dokümanlarını getirmek (hayali API kullanımını engeller) |
| **GitHub MCP** | Repo, commit, PR ve issue işlemleri |

### Çok faydalı
| MCP | Neden |
|---|---|
| **Chrome DevTools MCP** veya **Playwright MCP** (`🟡 KARAR`) | Ajanın siteyi açıp UI'ı test etmesi ve ekran görüntüsü alması |
| **Vercel MCP** | Deploy, log ve env yönetimi |
| **DataForSEO MCP** (resmi) | Geliştirme sırasında API cevaplarını denemek |
| **Resend MCP** | Test maili göndermek, domain durumunu kontrol etmek |

### Opsiyonel
| MCP | Neden |
|---|---|
| Paddle MCP (Paddle seçilirse) | Ürün, fiyat ve abonelik kurulumu |
| PostHog MCP | Event ve funnel kontrolü |
| Sentry MCP | Hata takibi |

> ⚠️ Production veritabanında Supabase MCP'yi **read-only** modda kullan. Yazma işlemleri sadece development branch'inde yapılmalı.

---

## 8. Veritabanı şeması (Supabase / Postgres)

```sql
-- Kullanıcı profili (auth.users ile 1-1)
profiles (
  id uuid PK → auth.users,
  role text check (role in ('client','admin')) default 'client',
  full_name text, email text, created_at timestamptz
)

-- Müşterinin temsil edilen uzman kimliği (1 plan = 1 profil)
expert_profiles (
  id uuid PK, owner_id uuid → profiles,
  display_name text, job_title text, company text,
  website_url text, target_url text,          -- linkin gideceği sayfa
  bio text, expertise_topics text[], excluded_topics text[],
  tone text,                                  -- "friendly", "authoritative"...
  sample_quotes text[],                       -- ses tonunu öğrenmek için
  headshot_url text, linkedin_url text,
  auto_approve boolean default false,         -- ileride opsiyonel
  min_match_score int default 70,
  active boolean default true, created_at timestamptz
)

-- Ham gelen mailler
inbound_emails (
  id uuid PK, source text,                    -- 'haro','sos','hab2bw','other'
  subject text, from_email text, raw_text text, raw_html text,
  received_at timestamptz, parsed boolean default false
)

-- Tek tek gazeteci soruları
queries (
  id uuid PK, inbound_email_id uuid → inbound_emails, source text,
  title text, body text, category text,
  outlet_name text, outlet_domain text, outlet_authority int,
  journalist_name text, reply_email text,
  requirements text, deadline timestamptz,
  created_at timestamptz
)

-- Soru × profil eşleşmesi
matches (
  id uuid PK, query_id uuid → queries, expert_profile_id uuid → expert_profiles,
  score int, reasoning text, created_at timestamptz,
  unique (query_id, expert_profile_id)
)

-- Pitch'ler
pitches (
  id uuid PK, match_id uuid → matches, expert_profile_id uuid,
  subject text, body text, edited_body text,
  status text check (status in
    ('draft','pending_approval','approved','rejected','sent','failed','expired')),
  approved_at timestamptz, sent_at timestamptz,
  resend_message_id text, error text, created_at timestamptz
)

-- Kazanılan linkler
backlinks (
  id uuid PK, expert_profile_id uuid, pitch_id uuid null,
  article_url text, outlet_domain text, target_url text,
  anchor_text text, is_dofollow boolean, authority_score int,
  first_seen_at timestamptz, verified_at timestamptz, status text  -- live/lost
)

-- Abonelik
subscriptions (
  id uuid PK, owner_id uuid → profiles, provider text,
  provider_subscription_id text, plan text, status text,
  current_period_end timestamptz, created_at timestamptz
)

-- Aylık rapor snapshot'ı
monthly_reports (
  id uuid PK, expert_profile_id uuid, month date,
  pitches_sent int, backlinks_won int, avg_authority numeric,
  pdf_url text, created_at timestamptz
)
```

**RLS:** `client` sadece `owner_id = auth.uid()` olan satırları görebilir. `queries` ve `inbound_emails` tablolarına sadece admin ve service role erişebilir.

---

## 9. AI pipeline detayları

### 9.1 Parser (Haiku)
- **Girdi:** Bültenin ham metni
- **Çıktı (JSON dizi):** `{title, body, category, outlet_name, outlet_domain, journalist_name, reply_email, requirements, deadline}`
- Reklam ve sponsorlu bölümler atılmalı.

### 9.2 Matcher (Haiku)
- **Girdi:** Soru + profil özeti (bio, konular, hariç tutulan konular)
- **Çıktı:** `{score: 0-100, reasoning: string, disqualifiers: string[]}`
- İlk olarak ucuz bir **ön filtre** çalışmalı: Kategori/anahtar kelime veya pgvector embedding benzerliği. `🟡 KARAR: pgvector ile embedding kullanılsın mı?` (Embedding için ayrı bir sağlayıcı gerekir, örneğin Voyage AI.)
- Skor `min_match_score` değerinin üstündeyse ve son tarih geçmemişse pitch yazılır.

### 9.3 Writer (Sonnet)
- **Sistem prompt'u:** Sen [display_name], [job_title] @ [company] olarak yazıyorsun. Ses tonu: [tone]. Örnek alıntılar: [...]
- **Kurallar:**
  - Gazetecinin sorusuna **doğrudan** cevap ver, 150–250 kelime, somut veri veya örnek içersin
  - Gazetecinin istediği formatı (requirements) harfiyen uygula
  - Uydurma istatistik, sahte deneyim veya sahte müşteri **yazma**. Emin olmadığın bilgi için `[DOĞRULA: ...]` etiketi koy. Bu etiket varken pitch gönderilemez.
  - Sonda kısa imza: ad, unvan, şirket, website, (varsa) headshot linki
- **Çıktı:** `{subject, body, needs_verification: string[]}`

### 9.4 Sender
- Sadece `approved` durumundaki pitch'ler gönderilir. Son tarih geçmişse durum `expired` olur.
- Rate limit: Bir profil için günde en fazla X pitch (`🟡 KARAR`, önerilen değer 10).
- Resend webhook'u ile `delivered`, `bounced` ve `complained` durumları takip edilir.

### 9.5 Tracker (günlük cron)
1. Son 60 günde gönderilmiş pitch'ler için SERP araması yapılır: `"display_name" site:outlet_domain`
2. DataForSEO Backlinks API ile müşteri domaininin yeni linkleri çekilir
3. Bulunan makale taranır, `target_url` linki ve `rel` özelliği kontrol edilir
4. Link bulunduysa `backlinks` tablosuna yazılır ve müşteriye "🎉 New backlink" maili gider
5. Mevcut linkler haftalık olarak yeniden kontrol edilir (`live` / `lost`)

---

## 10. Sayfalar

### Public (pazarlama)
| Route | İçerik |
|---|---|
| `/` | Landing (Bölüm 1.3'teki **akışı** kullan ama metinler, görseller ve marka **tamamen bizim** olsun) |
| `/pricing` | Plan kartları + SSS |
| `/how-it-works` | 3 adım + zaman çizelgesi |
| `/blog` | MDX ile blog (ayrı subdomain gerekmez) |
| `/login`, `/register` | Magic link + Google |
| `/terms`, `/privacy` | Yasal sayfalar |

> Landing'deki istatistikler, logolar ve testimonial'lar **gerçek veri gelene kadar boş bırakılmalı veya kaldırılmalı.** Sahte rakam, sahte müşteri yorumu ya da link alınmamış yayınların logosu **kullanılmayacak**.

### Müşteri paneli (`/app`)
| Route | İçerik |
|---|---|
| `/app/onboarding` | Adım adım: website URL → AI profil taslağı çıkarır → bio, konular, ton, örnek alıntılar, headshot → plan seçimi/ödeme |
| `/app` | Dashboard: bu ayki pitch sayısı, onay bekleyenler, kazanılan linkler, ortalama otorite, trafik grafiği (opsiyonel) |
| `/app/approvals` | Onay kuyruğu: soru + taslak yan yana, Onayla / Düzenle / Reddet, son tarih geri sayımı |
| `/app/pitches` | Tüm pitch'ler, durum filtresiyle |
| `/app/backlinks` | Link tablosu (yayın, otorite, dofollow, tarih, makale linki) + CSV export |
| `/app/reports` | Aylık raporlar (PDF indirme) |
| `/app/settings` | Profil, bildirimler, abonelik (müşteri portalı linki) |

### Admin paneli (`/admin`)
| Route | İçerik |
|---|---|
| `/admin` | Sistem sağlığı: gelen mail, parse edilen soru, gönderilen pitch, hata sayısı |
| `/admin/queries` | Tüm sorular + eşleşmeleri |
| `/admin/clients` | Müşteri listesi, garanti takibi (bu ay kazanılan link / hedef) |
| `/admin/pitches` | Tüm pitch'ler, elle düzenleme ve yeniden gönderme |
| `/admin/prompts` | Prompt versiyonları (A/B test için) |

---

## 11. Fiyatlandırma önerisi · `🟡 KARAR`
| Plan | Öneri | İçerik |
|---|---|---|
| Starter | 149 $/ay | 1 profil, ~50 pitch, link garantisi yok |
| Pro | 299 $/ay | 1 profil, ~150 pitch, **3+ link garantisi veya ertesi ay ücretsiz** |
| Agency | 799 $/ay | 5 profil, white-label rapor |

> Garanti koşulları "Terms" sayfasında açıkça yazılmalı. Plan isimleri ve fiyatlar kullanıcı onaylayana kadar config dosyasında tutulmalı, koda gömülmemeli.

---

## 12. Geliştirme fazları

| Faz | İçerik | Bitti sayılması için |
|---|---|---|
| **0 · Kurulum** | Next.js + Tailwind + shadcn, Supabase projesi, MCP'lerin bağlanması, `.env.example`, GitHub repo, Vercel deploy | Boş site canlıda |
| **1 · Auth + şema** | Supabase auth (magic link + Google), tüm tablolar, RLS, rol yapısı | Giriş yapan kullanıcı sadece kendi verisini görüyor |
| **2 · Onboarding** | Profil formu + AI ile siteden profil çıkarma | Profil kaydediliyor |
| **3 · Inbound + Parser** | Webhook, ham kayıt, Haiku ile soru ayırma, admin'de soru listesi | Gerçek bir HARO/SOS bülteni doğru parçalanıyor |
| **4 · Matcher + Writer** | Skorlama, pitch taslağı, `[DOĞRULA]` kontrolü | Test profili için mantıklı taslaklar çıkıyor |
| **5 · Onay + Gönderim** | Onay kuyruğu UI, Resend gönderimi, bildirim mailleri, rate limit | Onaylanan pitch test adresine ulaşıyor |
| **6 · Tracker** | DataForSEO + SERP, link doğrulama, backlink tablosu | Bilinen bir link otomatik tespit ediliyor |
| **7 · Ödeme** | Lemon Squeezy/Paddle checkout, webhook, plan limitleri | Test ödemesi aboneliği aktif ediyor |
| **8 · Landing + Blog** | Pazarlama sayfaları, SEO meta, sitemap, OG görselleri | Lighthouse skoru 90+ |
| **9 · Rapor + Admin** | Aylık rapor (PDF), admin panelleri, PostHog | Admin garanti takibini görebiliyor |
| **10 · Cilalama** | Hata takibi, e-posta şablonları, testler | Production'a hazır |

---

## 13. Ortam değişkenleri (`.env.example`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=
RESEND_FROM_DOMAIN=
INBOUND_WEBHOOK_SECRET=
# POSTMARK_SERVER_TOKEN=        # Postmark seçilirse

# SEO
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Payments (birini seç)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STORE_ID=
# PADDLE_API_KEY=
# PADDLE_WEBHOOK_SECRET=

# Jobs (seçime göre)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 14. Hukuki ve etik kurallar (ajan bunları uygulamalı)

1. **Platform kuralları:** HARO, Featured.com, SOS ve Help A B2B Writer'ın kullanım şartları, üçüncü taraf gönderimi ve AI ile yazılmış içerik konusunda kısıtlamalar içerebilir. Featured.com gibi hesap bazlı platformlar için **otomatik giriş veya scraping yapılmayacak.** Bu entegrasyonlar ancak resmi bir API veya partner programı varsa eklenecek (`🟡 KARAR`, kullanıcı araştırıp karar verecek).
2. **Doğruluk:** Pitch'lerde uydurma bilgi olmayacak. Müşteri onayı olmadan hiçbir pitch gönderilmeyecek (MVP için bu kural sabit).
3. **Pazarlama dürüstlüğü:** Sahte istatistik, sahte testimonial veya link alınmamış yayınların logosu kullanılmayacak.
4. **KVKK / GDPR:** Privacy policy, çerez onayı (PostHog için) ve hesap silme özelliği olacak.
5. **E-posta uyumu:** SPF, DKIM ve DMARC ayarları yapılacak, bounce ve complaint oranları izlenecek.

---

## 15. Antigravity'ye ilk prompt (kopyala-yapıştır)

```
Bu repodaki PROJECT_SPEC.md dosyasını baştan sona oku.
Bölüm 0'daki çalışma talimatına uy.
Faz 0'dan başla. Başlamadan önce Bölüm 7'deki zorunlu MCP'lerin bağlı olup
olmadığını kontrol et, eksik olanları bana listele ve kurulum adımlarını göster.
Karşına çıkan her "🟡 KARAR" noktasında dur, seçenekleri artı/eksileriyle sun,
birini öner ve benim cevabımı bekle.
```
