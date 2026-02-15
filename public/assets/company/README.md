# Company Images Setup

To use real company images in the Organization section, add the following image files to:

`public/assets/company/`

Required image files:
- company-1.png
- company-2.png  
- company-3.png
- company-4.png
- company-5.png
- company-6.png
- company-7.png

## Image Specifications:
- Format: PNG (preferred) or JPG
- Size: Recommended 200x200px or similar square aspect ratio
- Background: Transparent or white
- Content: Company logos or brand icons

## Fallback Behavior:
If images are not found, the component will automatically display:
- Row 1: 🏢 icon with company name
- Row 2: ⚡ icon with company name

The component uses Next.js Image optimization and error handling to ensure smooth operation whether images exist or not.
