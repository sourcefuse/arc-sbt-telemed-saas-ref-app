import { AssetGroup } from "src/data/categories";

const labels = {
  [AssetGroup.COMMON]: "Common",
  [AssetGroup.PRODUCT_IMAGES]: "Product Images",
  [AssetGroup.TEMPLATES]: "Templates",
} as const;


type Values = typeof labels[AssetGroup];

export function getAssetGroupLabel(assetGroup: AssetGroup): Values {
  return labels[assetGroup] ?? "Unknown";
}
