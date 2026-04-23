import { YooCheckout } from "@a2seven/yoo-checkout"

const shopId = process.env.YOOKASSA_SHOP_ID
const secretKey = process.env.YOOKASSA_SECRET_KEY

if (!shopId || !secretKey) {
  console.warn("[yookassa] missing YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY")
}

export const yookassa = new YooCheckout({
  shopId: shopId ?? "",
  secretKey: secretKey ?? "",
})
