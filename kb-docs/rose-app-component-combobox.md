# Rose App — Dropdown (Combobox) Component

في Figma (**Design System - NEW**) الـ component اسمه **Dropdown**، وفيه `Dropdown (light)` و `Dropdown (dark)`. مفيش layer اسمه Combobox.

تاسك السبرنت بتطلب تنفيذ الـ Dropdown كـ **Combobox** searchable من shadcn **Popover + Command**، جنب Select و Menu كمكونات منفصلة.

## Behavior

- **حقل بحث** جوّه القائمة بيفلتر العناصر (case-insensitive).
- **Keyboard navigation** (أسهم + Enter للاختيار). Escape بيقفل.
- **Click-outside** بيقفل القائمة.
- حالات التاسك: Default، Selected، Hovered، Loading، Empty، Error. Loading و Empty و Error مش مرسومين لوحدهم في Figma؛ ألوانهم من tokens النص والـ muted.

بيدعم Light/Dark + RTL/LTR.
