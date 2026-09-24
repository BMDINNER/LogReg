# @bmdinner/logreg

[English](README.md) | **Türkçe**

React uygulamaları için hafif bir kimlik doğrulama istemcisi.

`logreg`, giriş ve kayıt akışları için küçük bir araç seti sunar: bir `AuthProvider` context'i, form bileşenleri ve oturum yenilemeyi otomatik yöneten bir HTTP istemcisi. Frontend ile kimlik doğrulama mantığını barındıran backend arasında konumlanır — paket frontend tarafındaki işleri (form durumu, doğrulama, oturum yenileme) üstlenir ve kimlik bilgilerinin sahipliğini backend'e bırakır.

---

## Projenin Akış Diyagramı

<p align="center">
  <img src="logreg-tr.png" alt="Akış Diyagramı" width="600" />
  <br />
  <em>Logreg'in veri akışı ve diğer projelerime nasıl entegre edildiği.</em>
</p>
---

## Kurulum

```bash
npm install @bmdinner/logreg zod
```

`zod` bir peer dependency ve aynı zamanda form doğrulaması için gereklidir.

---

## Kullanım şekilleri

Uygulamanızı `AuthProvider` ile sarmalayın:

```tsx
import { AuthProvider } from '@bmdinner/logreg';

function App() {
  return (
    <AuthProvider authUrl="/auth">
      {/* uygulamanız */}
    </AuthProvider>
  );
}
```

`LoginForm` bileşenini bir Zod şemasıyla kullanın:

```tsx
import { LoginForm } from '@bmdinner/logreg';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçersiz e-posta'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

function LoginPage() {
  return (
    <LoginForm
      schema={loginSchema}
      submitButtonText="Giriş Yap"
      onSuccess={() => navigate('/dashboard')}
    />
  );
}
```

Aktif kullanıcıya `useAuth` ile erişin:

```tsx
import { useAuth } from '@bmdinner/logreg';

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <>
      <p>{user.email} olarak giriş yapıldı</p>
      <button onClick={logout}>Çıkış Yap</button>
    </>
  );
}
```

---

## API

### `AuthProvider`

Uygulamanızı sarmalar ve kimlik doğrulama durumunu yönetir.

| Prop                      | Tip                      | Varsayılan               | Açıklama                                                                                                                     |
|---------------------------|--------------------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `authUrl`                 | `string`                 |           —              | Auth endpoint'lerinin temel URL'si. Aynı origin için `''` kullanın.                                                          |
| `loginEndpoint`           | `string`                 | `/auth/login`            | Login Endpointi                                                                                                              |
| `registerEndpoint`        | `string`                 | `/auth/register`         | Register Endpointi                                                                                                           |
| `logoutEndpoint`          | `string`                 | `/auth/logout`           | Logout Endpointi                                                                                                             |
| `refreshEndpoint`         | `string`                 | `/auth/refresh`          | Token refresh Endpointi                                                                                                      |
| `verifyEndpoint`          | `string`                 | `/auth/verify`           | Mount sırasında aktif kullanıcıyı yüklemek için çağrılır.                                                                    |
| `forgotPasswordEndpoint`  | `string`                 | `/auth/forgot-password`  | "Şifremi unuttum" Endpointi(Şimdilik bu canlı projelerde çalışmıyor)                                                         |
| `resetPasswordEndpoint`   | `string`                 | `/auth/reset-password`   |  "Şifremi sıfırla" Endpointi(Bu endpointi harekete geçiren statik html sayfaları, CSP ile bloklanıyor, üzerinde çalışıyorum.)|
| `onError`                 | `(error: Error) => void` |           —              | İsteğe bağlı genel hata callback'i.                                                                                          |

### `useAuth`

Kimlik doğrulama context'ini döndürür.

```ts
const {
  user,
  loading,
  error,
  isAuthenticated,
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} = useAuth();
```

### `LoginForm` ve `RegisterForm`

Her iki bileşen de bir Zod şeması alır ve alanları şemadan üretir.

```tsx
<RegisterForm
  schema={registerSchema}
  submitButtonText="Hesap Oluştur"
  onSuccess={() => navigate('/login')}
  onError={(err) => toast.error(err.message)}
  renderField={(field, state) => <CustomInput {...field} {...state} />}
/>
```

| Prop               | Tip                           | Açıklama                                                        |
|--------------------|-------------------------------|-----------------------------------------------------------------|
| `schema`           | `z.ZodObject<any>`            | Zorunlu. Alanları ve doğrulama kurallarını tanımlar.            |
| `onSubmit`         | `(data) => Promise<any>`      | Varsayılan gönderim işleyicisini değiştirmek için isteğe bağlı. |
| `onSuccess`        | `(result) => void`            | Başarılı gönderimden sonra çağrılır.                            |
| `onError`          | `(error) => void`             | Hata durumunda çağrılır.                                        |
| `renderField`      | `(field, state) => ReactNode` | Kendi input bileşeninizi kullanın.                              |
| `submitButtonText` | `string`                      |                                                                 |
| `className`        | `string`                      |                                                                 |

### `AuthAPI`

Alt katmandaki HTTP istemcisi. React dışı entegrasyonlar için doğrudan kullanılabilir.

```ts
import { AuthAPI } from '@bmdinner/logreg';

const api = new AuthAPI('https://api.example.com', {
  login: '/auth/login',
  register: '/auth/register',
});

const user = await api.verifyToken();
```

---

## Mimari Notları

### Kimlik bilgileri nerede tutulur

Yaygın bir kalıp, frontend'in her istekte backend'e API anahtarı veya proje kimliği göndermesidir. `logreg` bunun tam tersini yapar:

- Frontend, backend'e yalnızca kullanıcı kimlik bilgilerini (e-posta, şifre, form verisi) gönderir.
- Backend, isteği auth servisine iletmeden önce kendi API anahtarını ve proje kimliğini ekler.
- Frontend bu değerleri hiçbir zaman görmez, saklamaz veya iletmez.

### Oturumlar nerede tutulur

`logreg` oturum saklama için HTTP-only cookie'ler kullanır. Token'lar hiçbir zaman `localStorage` veya `sessionStorage`'a yazılmaz ve JavaScript'e açık edilmez.

`AuthProvider`, mount sırasında `verifyEndpoint`'i çağırarak oturumu doğrular. Tarayıcı cookie'yi otomatik gönderir; backend doğrular ve aktif kullanıcıyı döndürür.

---

## Karşılaşılan Sorunlar ve Çözümleri

Bu paketi geliştirirken ve entegre ederken karşılaştığım sorunlar ve bunlara bulduğum çözümler.

### Yenilemeden ve sekme kapatıldıktan sonra kullanıcılar çıkış yapıyordu

**Sorun:** Sayfa her yenilendiğinde veya kullanıcı sekmeyi kapatıp geri döndüğünde tekrar giriş yapmaları gerekiyordu. Sayfa yüklemeleri arasında oturumu taşıyan bir şey yoktu, bu yüzden her yenileme sıfırdan başlıyordu.

**Çözümüm:** Kimliği doğrulanmış kullanıcıyı `localStorage`'a kaydettim. Girişte kullanıcı nesnesi `localStorage`'a yazılır. Uygulama mount olduğunda provider bunu geri okur, böylece arayüz hemen giriş yapılmış olarak görünür — bu sırada oturum backend'e karşı doğrulanmaya devam eder.

Yalnızca kullanıcı nesnesini kaydediyorum, oturum token'ını değil. Token, JavaScript'in okuyamadığı bir HTTP-only cookie'de tutulur. Cookie yoksa veya süresi dolmuşsa backend doğrulamayı reddeder ve kullanıcı çıkış yapmış olur — yani eski bir `localStorage` kaydı tek başına erişim sağlayamaz. Bu bir arayüz ipucudur, kimlik doğrulama mekanizması değildir.

---

### `apiKey` ve `projectId` frontend'den sızıyordu

**Sorun:** `apiKey` ve `projectId` frontend'den kütüphane üzerinden backend'e ve oradan auth servisine gönderiliyordu. Bu, değerlerin tarayıcıda görünür olması anlamına geliyordu — network sekmesinde, DevTools'ta, bakmak isteyen her yerde. Trafiği inceleyen biri bunları görebiliyordu.

**Çözümüm:** Veri akışını değiştirdim. Frontend'in API anahtarını ve proje kimliğini içeren istekleri oluşturması yerine, frontend artık backend'e yalnızca kullanıcının kimlik bilgilerini gönderiyor, backend bu değerleri kendisi ekleyip auth servisine iletiyor.

Eski akış:

```
frontend → logreg → backend → auth service
```

Yeni akış:

```
frontend → backend → auth service
```

`logreg` form alanlarını ve oturum yenilemeyi yönetiyor. Artık `apiKey` veya `projectId`'yi bilmiyor, umursamıyor — bu prop'lar tamamen kaldırıldı. Uygulama adına bir isteğe eklenmesi gereken her şey artık backend'de, tarayıcının göremeyeceği yerde yapılıyor.

**Bundan çıkardığım ders:** Tarayıcının bilmesi gereken bir değer varsa, tarayıcı o değeri sızdırabilir. Kimlik bilgilerini backend'e taşımak ve frontend'i ince bir istemci olarak tutmak daha güvenli varsayılandır.

---

### Form alanları sabit kodluydu ve projeler arasında yeniden kullanılamıyordu

**Sorun:** Giriş ve kayıt formlarının alan tanımları sabit kodluydu. Kütüphaneyi kullanan her projenin aynı alanlara ihtiyacı vardı. Bir proje kullanıcı adı alanı isteyip diğeri istemiyorsa veya farklı şifre kuralları istiyorsa, formları proje başına yeniden yazmadan bunu desteklemenin temiz bir yolu yoktu.

Eski yaklaşım ayrıca alan tanımlarını ve doğrulama kurallarını iki ayrı nesneye bölüyordu — input'lar için bir `fields` dizisi, kontroller için bir `validationRules` nesnesi. Bir alan eklediğimde veya değiştirdiğimde her ikisini de güncellemem ve senkron kalmalarını ummam gerekiyordu.

**Çözümüm:** Zod şemalarına geçtim. `LoginForm` ve `RegisterForm` artık tek bir `schema` prop'u alıyor. Bileşenler şemanın şeklini okuyup alanları ondan üretiyor — isim, etiket, zorunluluk, hepsi. Doğrulama `schema.safeParse(values)` çağrılarak yapılıyor.

Artık farklı projeler farklı şemalar geçebiliyor. Şemada hangi alanlar varsa, o alanlar o kurallarla render ediliyor. Önceki iki sorunum — alanların sabit olması ve kuralların alanlardan kopması — ikisi de ortadan kalktı, çünkü şema her ikisinin de tanımlandığı tek yer.

---

## Backend Sözleşmesi

`logreg` backend'in aşağıdaki endpoint'leri sunmasını bekler. Tüm cevaplar JSON'dur.

| Metot  | Yol                     | Gövde                           | Cevap                                       |
|--------|-------------------------|---------------------------------|---------------------------------------------|
| `POST` | `/auth/login`           | `{ email, password }`           | `{ user }` ve `Set-Cookie`                  |
| `POST` | `/auth/register`        | `{ username, email, password }` | `{ user }` ve `Set-Cookie`                  |
| `POST` | `/auth/logout`          | —                               | `{ success: true }` ve cookie'leri temizler |
| `POST` | `/auth/refresh`         | —                               | `{ success: true }` ve `Set-Cookie`         |
| `GET`  | `/auth/verify`          | —                               | `{ user }`                                  |
| `POST` | `/auth/forgot-password` | `{ email }`                     | `{ success: true }`                         |
| `POST` | `/auth/reset-password`  | `{ token, newPassword }`        | `{ success: true }`                         |

Backend'in sorumlulukları:

- Auth servisine iletirken kendi `apiKey` ve `projectId` değerlerini eklemek.
- Cookie'leri `HttpOnly` ve uygun `SameSite` öznitelikleriyle ayarlamak.
- Cross-origin cevaplarda `Access-Control-Allow-Credentials: true` döndürmek.

Frontend hiçbir zaman `apiKey` veya `projectId` göndermez.

---

## Lisans

MIT
