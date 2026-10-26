// MeetMates → Figma: переменные и стили одним прогоном.
// Сгенерировано scripts/build-figma-tokens.mjs из tokens.css — руками не править.
//
// Как запустить: открыть нужный файл в Figma, поставить плагин Scripter
// (Plugins → Scripter), вставить этот код и нажать Run. Плагин создаёт
// две коллекции переменных — Primitive и Semantic, — связывает семантику
// с примитивом алиасами и заводит стили для теней и размытия экрана.
// Повторный запуск не плодит дубли: существующие переменные обновляются.

const PRIMITIVE = [
  {
    "path": "color/white",
    "type": "COLOR",
    "value": {
      "r": 1,
      "g": 1,
      "b": 1
    },
    "css": "white"
  },
  {
    "path": "color/gray-100",
    "type": "COLOR",
    "value": {
      "r": 0.9254901960784314,
      "g": 0.9254901960784314,
      "b": 0.9254901960784314
    },
    "css": "gray-100"
  },
  {
    "path": "color/plum-950",
    "type": "COLOR",
    "value": {
      "r": 0.043137254901960784,
      "g": 0.0196078431372549,
      "b": 0.11372549019607843
    },
    "css": "plum-950"
  },
  {
    "path": "color/plum-900",
    "type": "COLOR",
    "value": {
      "r": 0.10196078431372549,
      "g": 0.06274509803921569,
      "b": 0.14901960784313725
    },
    "css": "plum-900"
  },
  {
    "path": "color/plum-800",
    "type": "COLOR",
    "value": {
      "r": 0.16470588235294117,
      "g": 0.10980392156862745,
      "b": 0.30196078431372547
    },
    "css": "plum-800"
  },
  {
    "path": "color/plum-600",
    "type": "COLOR",
    "value": {
      "r": 0.2980392156862745,
      "g": 0.24705882352941178,
      "b": 0.34901960784313724
    },
    "css": "plum-600"
  },
  {
    "path": "color/plum-400",
    "type": "COLOR",
    "value": {
      "r": 0.5490196078431373,
      "g": 0.49411764705882355,
      "b": 0.6078431372549019
    },
    "css": "plum-400"
  },
  {
    "path": "misc/coal-950",
    "type": "COLOR",
    "value": {
      "r": 0.054901960784313725,
      "g": 0.054901960784313725,
      "b": 0.06666666666666667
    },
    "css": "coal-950"
  },
  {
    "path": "misc/coal-900",
    "type": "COLOR",
    "value": {
      "r": 0.10980392156862745,
      "g": 0.10980392156862745,
      "b": 0.12941176470588237
    },
    "css": "coal-900"
  },
  {
    "path": "misc/coal-800",
    "type": "COLOR",
    "value": {
      "r": 0.19607843137254902,
      "g": 0.19607843137254902,
      "b": 0.23137254901960785
    },
    "css": "coal-800"
  },
  {
    "path": "misc/coal-700",
    "type": "COLOR",
    "value": {
      "r": 0.26666666666666666,
      "g": 0.26666666666666666,
      "b": 0.30980392156862746
    },
    "css": "coal-700"
  },
  {
    "path": "misc/coal-600",
    "type": "COLOR",
    "value": {
      "r": 0.30196078431372547,
      "g": 0.30196078431372547,
      "b": 0.3411764705882353
    },
    "css": "coal-600"
  },
  {
    "path": "misc/coal-200",
    "type": "COLOR",
    "value": {
      "r": 0.7686274509803922,
      "g": 0.7607843137254902,
      "b": 0.8
    },
    "css": "coal-200"
  },
  {
    "path": "misc/lavender-700",
    "type": "COLOR",
    "value": {
      "r": 0.2901960784313726,
      "g": 0.24705882352941178,
      "b": 0.5607843137254902
    },
    "css": "lavender-700"
  },
  {
    "path": "misc/lavender-400",
    "type": "COLOR",
    "value": {
      "r": 0.6705882352941176,
      "g": 0.6235294117647059,
      "b": 0.9490196078431372
    },
    "css": "lavender-400"
  },
  {
    "path": "misc/lavender-300",
    "type": "COLOR",
    "value": {
      "r": 0.7490196078431373,
      "g": 0.7098039215686275,
      "b": 0.9686274509803922
    },
    "css": "lavender-300"
  },
  {
    "path": "color/lilac-50",
    "type": "COLOR",
    "value": {
      "r": 0.9490196078431372,
      "g": 0.9294117647058824,
      "b": 0.9647058823529412
    },
    "css": "lilac-50"
  },
  {
    "path": "color/lilac-100",
    "type": "COLOR",
    "value": {
      "r": 0.9137254901960784,
      "g": 0.8823529411764706,
      "b": 0.9450980392156862
    },
    "css": "lilac-100"
  },
  {
    "path": "color/lilac-150",
    "type": "COLOR",
    "value": {
      "r": 0.8941176470588236,
      "g": 0.8549019607843137,
      "b": 0.9176470588235294
    },
    "css": "lilac-150"
  },
  {
    "path": "color/lilac-200",
    "type": "COLOR",
    "value": {
      "r": 0.8901960784313725,
      "g": 0.8549019607843137,
      "b": 0.9372549019607843
    },
    "css": "lilac-200"
  },
  {
    "path": "color/lilac-300",
    "type": "COLOR",
    "value": {
      "r": 0.8784313725490196,
      "g": 0.8392156862745098,
      "b": 0.9333333333333333
    },
    "css": "lilac-300"
  },
  {
    "path": "color/lime-300",
    "type": "COLOR",
    "value": {
      "r": 0.8509803921568627,
      "g": 0.9607843137254902,
      "b": 0.43529411764705883
    },
    "css": "lime-300"
  },
  {
    "path": "color/crimson-600",
    "type": "COLOR",
    "value": {
      "r": 0.7529411764705882,
      "g": 0.12156862745098039,
      "b": 0.2901960784313726
    },
    "css": "crimson-600"
  },
  {
    "path": "color/crimson-700",
    "type": "COLOR",
    "value": {
      "r": 0.5882352941176471,
      "g": 0.07058823529411765,
      "b": 0.22745098039215686
    },
    "css": "crimson-700"
  },
  {
    "path": "color/crimson-900",
    "type": "COLOR",
    "value": {
      "r": 0.3607843137254902,
      "g": 0.13725490196078433,
      "b": 0.2196078431372549
    },
    "css": "crimson-900"
  },
  {
    "path": "color/rose-200",
    "type": "COLOR",
    "value": {
      "r": 0.984313725490196,
      "g": 0.7607843137254902,
      "b": 0.807843137254902
    },
    "css": "rose-200"
  },
  {
    "path": "color/rose-300",
    "type": "COLOR",
    "value": {
      "r": 0.9607843137254902,
      "g": 0.6078431372549019,
      "b": 0.6862745098039216
    },
    "css": "rose-300"
  },
  {
    "path": "gradient/page-wash",
    "type": "STRING",
    "value": "radial-gradient(70% 40% at 100% 0%, rgba(246, 222, 235, .5) 0%, rgba(248, 228, 238, .32) 38%, rgba(250, 234, 241, 0) 80%), radial-gradient(88% 26% at 46% -6%, rgba(206, 216, 240, .46) 0%, rgba(212, 221, 242, 0) 60%), linear-gradient(180deg, #E4DAEA 0%, #EADBE8 9%, #EDDBE6 15%, #ECDBE4 20%, #EDDEE7 27%, #F0E4EB 32%, #F3EAEF 37%, #F4F0F3 42%, #F7F4F6 48%, #FAFAFB 53%, #FFFFFF 57%, #FFFFFF 100%)",
    "css": "gradient-page-wash"
  },
  {
    "path": "gradient/page-wash-dark",
    "type": "STRING",
    "value": "radial-gradient(82% 34% at 50% -6%, rgba(171, 159, 242, .32) 0%, rgba(171, 159, 242, .10) 52%, rgba(171, 159, 242, 0) 78%), linear-gradient(180deg, #4A3F8F 0%, #423880 8%, #38306B 16%, #2D2754 26%, #221E3C 38%, #19172A 48%, #12121C 56%, #0E0E11 62%, #0E0E11 100%)",
    "css": "gradient-page-wash-dark"
  },
  {
    "path": "effect/shadow-dot",
    "type": "STRING",
    "value": "0 1px 3px rgba(11, 5, 29, .45)",
    "css": "shadow-dot"
  },
  {
    "path": "effect/ring-dot",
    "type": "STRING",
    "value": "inset 0 0 0 1px var(--white)",
    "css": "ring-dot"
  },
  {
    "path": "misc/font-sans",
    "type": "STRING",
    "value": "\"Figtree\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
    "css": "font-sans"
  },
  {
    "path": "font-size/text-34",
    "type": "FLOAT",
    "value": 34,
    "css": "text-34"
  },
  {
    "path": "font-size/text-28",
    "type": "FLOAT",
    "value": 28,
    "css": "text-28"
  },
  {
    "path": "font-size/text-22",
    "type": "FLOAT",
    "value": 22,
    "css": "text-22"
  },
  {
    "path": "font-size/text-20",
    "type": "FLOAT",
    "value": 20,
    "css": "text-20"
  },
  {
    "path": "font-size/text-18",
    "type": "FLOAT",
    "value": 18,
    "css": "text-18"
  },
  {
    "path": "font-size/text-16",
    "type": "FLOAT",
    "value": 16,
    "css": "text-16"
  },
  {
    "path": "font-size/text-14",
    "type": "FLOAT",
    "value": 14,
    "css": "text-14"
  },
  {
    "path": "font-size/text-12",
    "type": "FLOAT",
    "value": 12,
    "css": "text-12"
  },
  {
    "path": "weight/700",
    "type": "FLOAT",
    "value": 700,
    "css": "weight-700"
  },
  {
    "path": "weight/600",
    "type": "FLOAT",
    "value": 600,
    "css": "weight-600"
  },
  {
    "path": "weight/500",
    "type": "FLOAT",
    "value": 500,
    "css": "weight-500"
  },
  {
    "path": "weight/400",
    "type": "FLOAT",
    "value": 400,
    "css": "weight-400"
  },
  {
    "path": "leading/150",
    "type": "FLOAT",
    "value": 1.5,
    "css": "leading-150"
  },
  {
    "path": "leading/145",
    "type": "FLOAT",
    "value": 1.45,
    "css": "leading-145"
  },
  {
    "path": "leading/125",
    "type": "FLOAT",
    "value": 1.25,
    "css": "leading-125"
  },
  {
    "path": "leading/105",
    "type": "FLOAT",
    "value": 1.05,
    "css": "leading-105"
  },
  {
    "path": "leading/100",
    "type": "FLOAT",
    "value": 1,
    "css": "leading-100"
  },
  {
    "path": "tracking/button",
    "type": "STRING",
    "value": "-0.01em",
    "css": "tracking-button"
  },
  {
    "path": "tracking/heading",
    "type": "STRING",
    "value": "-0.015em",
    "css": "tracking-heading"
  },
  {
    "path": "tracking/display",
    "type": "STRING",
    "value": "-0.035em",
    "css": "tracking-display"
  },
  {
    "path": "measure/text",
    "type": "STRING",
    "value": "30ch",
    "css": "measure-text"
  },
  {
    "path": "space/48",
    "type": "FLOAT",
    "value": 48,
    "css": "space-48"
  },
  {
    "path": "space/32",
    "type": "FLOAT",
    "value": 32,
    "css": "space-32"
  },
  {
    "path": "space/24",
    "type": "FLOAT",
    "value": 24,
    "css": "space-24"
  },
  {
    "path": "space/16",
    "type": "FLOAT",
    "value": 16,
    "css": "space-16"
  },
  {
    "path": "space/12",
    "type": "FLOAT",
    "value": 12,
    "css": "space-12"
  },
  {
    "path": "space/8",
    "type": "FLOAT",
    "value": 8,
    "css": "space-8"
  },
  {
    "path": "space/6",
    "type": "FLOAT",
    "value": 6,
    "css": "space-6"
  },
  {
    "path": "space/4",
    "type": "FLOAT",
    "value": 4,
    "css": "space-4"
  },
  {
    "path": "space/2",
    "type": "FLOAT",
    "value": 2,
    "css": "space-2"
  },
  {
    "path": "space/label",
    "type": "STRING",
    "value": "2px 8px",
    "css": "space-label"
  },
  {
    "path": "space/mark",
    "type": "STRING",
    "value": ".02em .12em",
    "css": "space-mark"
  },
  {
    "path": "radius/pill",
    "type": "FLOAT",
    "value": 999,
    "css": "radius-pill"
  },
  {
    "path": "radius/lg",
    "type": "FLOAT",
    "value": 26,
    "css": "radius-lg"
  },
  {
    "path": "radius/md",
    "type": "FLOAT",
    "value": 18,
    "css": "radius-md"
  },
  {
    "path": "radius/sm",
    "type": "FLOAT",
    "value": 14,
    "css": "radius-sm"
  },
  {
    "path": "size/screen-h",
    "type": "FLOAT",
    "value": 844,
    "css": "size-screen-h"
  },
  {
    "path": "size/card",
    "type": "FLOAT",
    "value": 400,
    "css": "size-card"
  },
  {
    "path": "size/screen-w",
    "type": "FLOAT",
    "value": 390,
    "css": "size-screen-w"
  },
  {
    "path": "size/radar",
    "type": "FLOAT",
    "value": 340,
    "css": "size-radar"
  },
  {
    "path": "size/cover",
    "type": "FLOAT",
    "value": 168,
    "css": "size-cover"
  },
  {
    "path": "size/textarea",
    "type": "FLOAT",
    "value": 96,
    "css": "size-textarea"
  },
  {
    "path": "size/state-icon",
    "type": "FLOAT",
    "value": 64,
    "css": "size-state-icon"
  },
  {
    "path": "size/thumb",
    "type": "FLOAT",
    "value": 56,
    "css": "size-thumb"
  },
  {
    "path": "size/control",
    "type": "FLOAT",
    "value": 44,
    "css": "size-control"
  },
  {
    "path": "size/icon-lg",
    "type": "FLOAT",
    "value": 32,
    "css": "size-icon-lg"
  },
  {
    "path": "size/icon-md",
    "type": "FLOAT",
    "value": 24,
    "css": "size-icon-md"
  },
  {
    "path": "size/avatar",
    "type": "FLOAT",
    "value": 24,
    "css": "size-avatar"
  },
  {
    "path": "size/icon-button",
    "type": "FLOAT",
    "value": 20,
    "css": "size-icon-button"
  },
  {
    "path": "size/icon-sm",
    "type": "FLOAT",
    "value": 16,
    "css": "size-icon-sm"
  },
  {
    "path": "size/scroll-gutter",
    "type": "FLOAT",
    "value": 10,
    "css": "size-scroll-gutter"
  },
  {
    "path": "size/avatar-drop",
    "type": "FLOAT",
    "value": -6,
    "css": "size-avatar-drop"
  },
  {
    "path": "size/radar-5",
    "type": "FLOAT",
    "value": 300,
    "css": "size-radar-5"
  },
  {
    "path": "size/radar-4",
    "type": "FLOAT",
    "value": 250,
    "css": "size-radar-4"
  },
  {
    "path": "size/radar-3",
    "type": "FLOAT",
    "value": 200,
    "css": "size-radar-3"
  },
  {
    "path": "size/radar-2",
    "type": "FLOAT",
    "value": 150,
    "css": "size-radar-2"
  },
  {
    "path": "size/radar-1",
    "type": "FLOAT",
    "value": 100,
    "css": "size-radar-1"
  },
  {
    "path": "size/skel-count",
    "type": "FLOAT",
    "value": 80,
    "css": "size-skel-count"
  },
  {
    "path": "size/dot-lg",
    "type": "FLOAT",
    "value": 72,
    "css": "size-dot-lg"
  },
  {
    "path": "size/dot",
    "type": "FLOAT",
    "value": 56,
    "css": "size-dot"
  },
  {
    "path": "size/dot-sm",
    "type": "FLOAT",
    "value": 40,
    "css": "size-dot-sm"
  },
  {
    "path": "size/skel-pill",
    "type": "FLOAT",
    "value": 20,
    "css": "size-skel-pill"
  },
  {
    "path": "size/blur-photo",
    "type": "FLOAT",
    "value": 14,
    "css": "size-blur-photo"
  },
  {
    "path": "size/skel-line",
    "type": "FLOAT",
    "value": 12,
    "css": "size-skel-line"
  },
  {
    "path": "size/pager-dot",
    "type": "FLOAT",
    "value": 6,
    "css": "size-pager-dot"
  },
  {
    "path": "size/dot-ring",
    "type": "FLOAT",
    "value": 4,
    "css": "size-dot-ring"
  },
  {
    "path": "size/hairline",
    "type": "FLOAT",
    "value": 1,
    "css": "size-hairline"
  },
  {
    "path": "measure/width-bubble",
    "type": "STRING",
    "value": "80%",
    "css": "width-bubble"
  },
  {
    "path": "measure/width-l",
    "type": "STRING",
    "value": "62%",
    "css": "width-l"
  },
  {
    "path": "measure/width-m",
    "type": "STRING",
    "value": "44%",
    "css": "width-m"
  },
  {
    "path": "measure/width-s",
    "type": "STRING",
    "value": "28%",
    "css": "width-s"
  },
  {
    "path": "duration/slow",
    "type": "STRING",
    "value": "300ms",
    "css": "duration-slow"
  },
  {
    "path": "duration/fast",
    "type": "STRING",
    "value": "200ms",
    "css": "duration-fast"
  },
  {
    "path": "duration/skeleton",
    "type": "STRING",
    "value": "1.4s",
    "css": "duration-skeleton"
  },
  {
    "path": "misc/ease-out",
    "type": "STRING",
    "value": "cubic-bezier(0.16, 1, 0.3, 1)",
    "css": "ease-out"
  },
  {
    "path": "misc/zoom-hover",
    "type": "FLOAT",
    "value": 1.06,
    "css": "zoom-hover"
  },
  {
    "path": "misc/opacity-off",
    "type": "FLOAT",
    "value": 0.5,
    "css": "opacity-off"
  }
];
const SEMANTIC = [
  {
    "path": "bg/page",
    "alias": "color/white",
    "css": "bg-page"
  },
  {
    "path": "bg/page-wash",
    "alias": "gradient/page-wash",
    "css": "bg-page-wash"
  },
  {
    "path": "bg/surface",
    "alias": "color/white",
    "css": "bg-surface"
  },
  {
    "path": "bg/secondary",
    "alias": "color/lilac-50",
    "css": "bg-secondary"
  },
  {
    "path": "bg/nested",
    "alias": "color/lilac-50",
    "css": "bg-nested"
  },
  {
    "path": "text/primary",
    "alias": "color/plum-900",
    "css": "text-primary"
  },
  {
    "path": "text/muted",
    "alias": "color/plum-600",
    "css": "text-muted"
  },
  {
    "path": "text/on-action",
    "alias": "color/white",
    "css": "text-on-action"
  },
  {
    "path": "text/danger",
    "alias": "color/crimson-700",
    "css": "text-danger"
  },
  {
    "path": "icon/muted",
    "alias": "color/plum-400",
    "css": "icon-muted"
  },
  {
    "path": "color/action",
    "alias": "color/plum-950",
    "css": "color-action"
  },
  {
    "path": "text/on-verified",
    "alias": "color/plum-900",
    "css": "text-on-verified"
  },
  {
    "path": "color/verified",
    "alias": "color/lime-300",
    "css": "color-verified"
  },
  {
    "path": "color/danger",
    "alias": "color/crimson-600",
    "css": "color-danger"
  },
  {
    "path": "border/hairline",
    "alias": "color/gray-100",
    "css": "border-hairline"
  },
  {
    "path": "bg/hover",
    "alias": "color/lilac-100",
    "css": "bg-hover"
  },
  {
    "path": "bg/selected",
    "alias": "color/lilac-300",
    "css": "bg-selected"
  },
  {
    "path": "text/on-selected",
    "alias": "color/plum-900",
    "css": "text-on-selected"
  },
  {
    "path": "color/action-hover",
    "alias": "color/plum-800",
    "css": "color-action-hover"
  },
  {
    "path": "border/focus",
    "alias": "color/plum-400",
    "css": "border-focus"
  },
  {
    "path": "bg/mine",
    "alias": "color/lilac-200",
    "css": "bg-mine"
  },
  {
    "path": "bg/undelivered",
    "alias": "color/rose-300",
    "css": "bg-undelivered"
  },
  {
    "path": "color/shadow-1",
    "type": "STRING",
    "value": "0 0 0 1px var(--border-hairline), 0 1px 2px rgba(17, 17, 17, .04)",
    "css": "shadow-1"
  },
  {
    "path": "color/shadow-2",
    "type": "STRING",
    "value": "0 0 0 1px var(--border-hairline), 0 1px 2px rgba(17, 17, 17, .04), 0 2px 8px rgba(17, 17, 17, .06)",
    "css": "shadow-2"
  },
  {
    "path": "color/shadow-3",
    "type": "STRING",
    "value": "0 0 0 1px var(--border-hairline), 0 2px 10px rgba(17, 17, 17, .07)",
    "css": "shadow-3"
  },
  {
    "path": "color/ring-hairline",
    "type": "STRING",
    "value": "0 0 0 1px var(--border-hairline)",
    "css": "ring-hairline"
  },
  {
    "path": "color/ring-hairline-inset",
    "type": "STRING",
    "value": "inset 0 0 0 1px var(--border-hairline)",
    "css": "ring-hairline-inset"
  },
  {
    "path": "color/ring-focus",
    "type": "STRING",
    "value": "0 0 0 1px var(--border-focus)",
    "css": "ring-focus"
  },
  {
    "path": "color/ring-error",
    "type": "STRING",
    "value": "0 0 0 1px var(--color-danger)",
    "css": "ring-error"
  },
  {
    "path": "bg/skeleton",
    "type": "STRING",
    "value": "linear-gradient(90deg, var(--bg-nested) 0%, var(--bg-hover) 50%, var(--bg-nested) 100%)",
    "css": "bg-skeleton"
  }
];
const SEMANTIC_DARK = [
  {
    "path": "bg/page",
    "alias": "misc/coal-950",
    "css": "bg-page"
  },
  {
    "path": "bg/page-wash",
    "alias": "gradient/page-wash-dark",
    "css": "bg-page-wash"
  },
  {
    "path": "bg/surface",
    "alias": "misc/coal-800",
    "css": "bg-surface"
  },
  {
    "path": "bg/nested",
    "alias": "misc/coal-900",
    "css": "bg-nested"
  },
  {
    "path": "bg/secondary",
    "alias": "misc/coal-700",
    "css": "bg-secondary"
  },
  {
    "path": "text/primary",
    "alias": "color/lilac-50",
    "css": "text-primary"
  },
  {
    "path": "text/muted",
    "alias": "misc/coal-200",
    "css": "text-muted"
  },
  {
    "path": "icon/muted",
    "alias": "color/plum-400",
    "css": "icon-muted"
  },
  {
    "path": "color/action",
    "alias": "misc/lavender-400",
    "css": "color-action"
  },
  {
    "path": "text/on-action",
    "alias": "misc/coal-950",
    "css": "text-on-action"
  },
  {
    "path": "color/action-hover",
    "alias": "misc/lavender-300",
    "css": "color-action-hover"
  },
  {
    "path": "color/danger",
    "alias": "color/rose-200",
    "css": "color-danger"
  },
  {
    "path": "text/danger",
    "alias": "color/rose-200",
    "css": "text-danger"
  },
  {
    "path": "border/hairline",
    "alias": "misc/coal-950",
    "css": "border-hairline"
  },
  {
    "path": "border/focus",
    "alias": "misc/lavender-400",
    "css": "border-focus"
  },
  {
    "path": "bg/hover",
    "alias": "misc/coal-600",
    "css": "bg-hover"
  },
  {
    "path": "bg/selected",
    "alias": "misc/lavender-400",
    "css": "bg-selected"
  },
  {
    "path": "text/on-selected",
    "alias": "misc/coal-950",
    "css": "text-on-selected"
  },
  {
    "path": "bg/mine",
    "alias": "misc/coal-700",
    "css": "bg-mine"
  },
  {
    "path": "bg/undelivered",
    "alias": "color/crimson-900",
    "css": "bg-undelivered"
  }
];

const EFFECTS = [
  {
    "name": "shadow-dot",
    "value": "0 1px 3px rgba(11, 5, 29, .45)"
  },
  {
    "name": "ring-dot",
    "value": "inset 0 0 0 1px var(--white)"
  }
];
const GRADIENTS = [
  {
    "name": "gradient-page-wash",
    "value": "radial-gradient(70% 40% at 100% 0%, rgba(246, 222, 235, .5) 0%, rgba(248, 228, 238, .32) 38%, rgba(250, 234, 241, 0) 80%), radial-gradient(88% 26% at 46% -6%, rgba(206, 216, 240, .46) 0%, rgba(212, 221, 242, 0) 60%), linear-gradient(180deg, #E4DAEA 0%, #EADBE8 9%, #EDDBE6 15%, #ECDBE4 20%, #EDDEE7 27%, #F0E4EB 32%, #F3EAEF 37%, #F4F0F3 42%, #F7F4F6 48%, #FAFAFB 53%, #FFFFFF 57%, #FFFFFF 100%)"
  },
  {
    "name": "gradient-page-wash-dark",
    "value": "radial-gradient(82% 34% at 50% -6%, rgba(171, 159, 242, .32) 0%, rgba(171, 159, 242, .10) 52%, rgba(171, 159, 242, 0) 78%), linear-gradient(180deg, #4A3F8F 0%, #423880 8%, #38306B 16%, #2D2754 26%, #221E3C 38%, #19172A 48%, #12121C 56%, #0E0E11 62%, #0E0E11 100%)"
  }
];

async function run() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const pick = (name) => collections.find((c) => c.name === name)
    || figma.variables.createVariableCollection(name);
  const primCol = pick('Primitive');
  const semCol = pick('Semantic');

  const existing = await figma.variables.getLocalVariablesAsync();
  const byName = new Map(existing.map((v) => [v.variableCollectionId + '|' + v.name, v]));
  const ensure = (col, path, type) => {
    const key = col.id + '|' + path;
    return byName.get(key) || figma.variables.createVariable(path, col, type);
  };

  const made = new Map();
  for (const t of PRIMITIVE) {
    const v = ensure(primCol, t.path, t.type);
    v.setValueForMode(primCol.modes[0].modeId, t.value);
    v.description = '--' + t.css;
    made.set(t.path, v);
  }
  let aliased = 0;
  for (const t of SEMANTIC) {
    if (t.alias) {
      const target = made.get(t.alias);
      if (!target) { console.warn('нет примитива для', t.path, '→', t.alias); continue; }
      const v = ensure(semCol, t.path, target.resolvedType);
      v.setValueForMode(semCol.modes[0].modeId, figma.variables.createVariableAlias(target));
      v.description = '--' + t.css + ' → --' + t.alias.split('/').pop();
      aliased += 1;
    } else {
      const v = ensure(semCol, t.path, 'STRING');
      v.setValueForMode(semCol.modes[0].modeId, t.value);
      v.description = '--' + t.css;
    }
  }

  // тёмная тема — второй режим той же коллекции, а не второй набор имён:
  // так Figma переключает макет целиком, как продукт переключает data-theme
  const darkMode = semCol.modes.find((m) => m.name === 'Dark')
    || { modeId: semCol.addMode('Dark') };
  const semByPath = new Map();
  for (const t of SEMANTIC) {
    const v = byName.get(semCol.id + '|' + t.path);
    if (v) semByPath.set(t.path, v);
  }
  const semVars = await figma.variables.getLocalVariablesAsync();
  for (const v of semVars) if (v.variableCollectionId === semCol.id) semByPath.set(v.name, v);
  let darkSet = 0;
  for (const t of SEMANTIC_DARK) {
    const v = semByPath.get(t.path);
    if (!v) { console.warn('нет роли для тёмного режима:', t.path); continue; }
    if (t.alias) {
      const target = made.get(t.alias);
      if (!target) { console.warn('нет примитива для', t.path, '→', t.alias); continue; }
      v.setValueForMode(darkMode.modeId, figma.variables.createVariableAlias(target));
    } else {
      v.setValueForMode(darkMode.modeId, t.value);
    }
    darkSet += 1;
  }

  // тени и размытие переменными не держатся — заводим стилями
  const styles = await figma.getLocalEffectStylesAsync();
  for (const e of EFFECTS) {
    const name = 'shadow/' + e.name;
    const style = styles.find((s) => s.name === name) || figma.createEffectStyle();
    style.name = name;
    style.description = '--' + e.name + ': ' + e.value;
  }

  figma.notify(
    'Перенесено: ' + PRIMITIVE.length + ' примитивов, ' + SEMANTIC.length +
    ' ролей (из них ссылками ' + aliased + '), тёмных значений ' + darkSet +
    ', стилей теней ' + EFFECTS.length
  );
}

run();
