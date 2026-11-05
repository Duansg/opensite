# 像素头像

原图由站点所有者指定：[GitHub 头像](https://avatars.githubusercontent.com/u/112607719)。使用内置 imagegen 编辑为透明背景的像素头像，保留黑色巫师、黄星、紫色帽带和原表情。

- `generated.png`：内置 imagegen 返回的原始透明 PNG，保留供后续重新导出。
- `../../public/images/avatar-pixel.png`：网站使用的本地素材。原始输出以最近邻采样为 64×64 网格，再按整数倍导出为 576×576 PNG；64 格使瞳孔等小细节保持清晰。
- `../../public/favicon.svg`：嵌入相同像素网格，配合站点主色背景。
- `../../public/og.svg`、`../../public/og.png`：使用同一像素头像的分享封面。

网站运行时无需请求 GitHub 头像。缩放使用最近邻算法，保留透明通道。

## 最终生成提示词

```text
Use case: style-transfer. Edit target: the attached GitHub avatar. Create one square, production-ready pixel-mosaic avatar asset for a neo-brutalist personal blog. Preserve the EXACT recognizable character and composition: a black rounded, slightly irregular humanoid head and shoulders, two wide white eyes with tiny black pupils, a short horizontal white mouth, a floppy black wizard cap with a yellow brim, a purple diagonal band and the same yellow star decorations including the large hanging star at left. Preserve the original expression, proportions, pose, and feature placement; do not replace the character with a human, generic pixel punk, or another mascot. Change only the visual rendering into deliberate low-resolution square-pixel mosaic art on a regular approximately 48 by 48 logical pixel grid, with large clearly visible solid color cells and stepped pixel edges. Use a small flat palette of the original black, warm yellow, purple and white. No blur, no gradients, no smooth curves, no anti-aliased outlines, no tiny textured pixels, no text, no additional props, no border or panel. Remove only the white background to actual transparency, preserving the white eyeballs and mouth as opaque white. Keep the complete cap, left star, face and shoulders visible inside the square, with a little transparent space above the cap, and shoulders reaching the bottom. Deliver a clean transparent PNG-style single avatar, suitable for both a large pixel-scatter canvas and small UI icons.
```
