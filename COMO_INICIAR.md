# 🚀 Como Iniciar Studios Tatto

## ⚡ Opção RÁPIDA (Recomendado)

**Abra 2 terminais:**

### Terminal 1 - Backend
```bash
npm run dev:server
```

Deve aparecer:
```
✓ API rodando em http://localhost:5175
```

### Terminal 2 - Frontend  
```bash
npm run dev:web
```

Deve aparecer:
```
VITE ready in X ms
Local: http://localhost:5173/
```

## ✅ Verificação

Quando ambos estiverem rodando:
- 🌐 Abra http://localhost:5173 no browser
- ✓ O site deve carregar normalmente

---

## 📸 Galeria de Imagens

As 16 imagens de tatuagens já estão em:
- `frontend/public/gallery/`
- Acessíveis via http://localhost:5175/gallery/

---

## 🔧 Scripts Disponíveis

```bash
npm run dev:server    # Backend/API
npm run dev:web       # Frontend (Vite)
npm run build         # Build para produção
```

---

## ⚠️ Troubleshooting

**Porta 5173 em uso?**
```bash
npx kill-port 5173
```

**Porta 5175 em uso?**
```bash
npx kill-port 5175
```

**Tudo em uso?**
```bash
taskkill /F /IM node.exe
```

---

## 📝 Status do Projeto

✅ Backend funcional (modo offline, sem PostgreSQL)  
✅ Frontend funcional (React + Vite)  
✅ 16 imagens de tatuagens integradas  
✅ API respondendo em localhost:5175  

**Tudo pronto! 🎉**
