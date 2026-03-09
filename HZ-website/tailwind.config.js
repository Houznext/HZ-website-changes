/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
    darkMode: ['class'],
	mode: 'jit',
    content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
	'./app/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js',
    './node_modules/flowbite/**/*.js',
	"./pages/**/*.{js,ts,jsx,tsx}",  
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		transitionProperty: {
  			height: 'height',
  			spacing: 'margin, padding'
  		},
  		boxShadow: {
  			custom: '0px 4px 10px 0px #AEBBC940',
  			'custom-card': '10px 10px 20px 10px #AEBBC940'
  		},
  		keyframes: {
  			spinner_y0fdc1: {
  				'0%': {
  					transform: 'rotate(45deg) rotateX(-25deg) rotateY(25deg)'
  				},
  				'50%': {
  					transform: ' rotate(45deg) rotateX(-385deg) rotateY(25deg)'
  				},
  				'100%': {
  					transform: 'rotate(45deg) rotateX(-385deg) rotateY(385deg)'
  				}
  			},
		customPulse: {
    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.3)', opacity: '0.7' },
  },
  			moveUpDown: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
			indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(10%)" },
          "100%": { transform: "translateX(120%)" },
        },
			shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
			loaderCardIn: {
          "0%": { opacity: "0", transform: "translateX(-24px) scale(0.95)" },
          "60%": { opacity: "1", transform: "translateX(0) scale(1)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
			fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
			iconRotateOut: {
          "0%": { opacity: "1", transform: "rotate(0deg) scale(1)" },
          "100%": { opacity: "0", transform: "rotate(-110deg) scale(0.7)" },
        },
			iconRotateIn: {
          "0%": { opacity: "0", transform: "rotate(110deg) scale(0.7)" },
          "100%": { opacity: "1", transform: "rotate(0deg) scale(1)" },
        },
			"launch-btn-shimmer": {
          "0%": { transform: "translateX(-200%)" },
          "100%": { transform: "translateX(400%)" },
        },
  		},
  		animation: {
  			spinner: 'spinner_y0fdc1 2s infinite ease',
  			'move-up-down': 'moveUpDown 1.5s ease-in-out infinite',
			 indeterminate: "indeterminate 1.6s ease-in-out infinite",
			  'custom-pulse': 'customPulse 1.5s ease-in-out infinite',
			  shimmer: "shimmer 1.8s ease-in-out infinite",
			  'loader-card-in': "loaderCardIn 0.5s ease-out forwards",
			  fadeIn: "fadeIn 0.3s ease-out",
			  'icon-rotate-out': "iconRotateOut 0.35s ease-in forwards",
			  'icon-rotate-in': "iconRotateIn 0.35s ease-out forwards",
			  'launch-btn-shimmer': "launch-btn-shimmer 2.5s ease-in-out infinite",
  		},
  		fontFamily: {
   			sans: [
   				'Gordita',
                   ...defaultTheme.fontFamily.sans
               ],
  			kaushan: [
  				'Kaushan Script',
  				'cursive'
  			],
  			jacques: [
  				'Jacques Francois',
  				'serif'
  			]
  		},
  		backgroundImage: {
  			'custom-gradient': 'linear-gradient(94.46deg, #F7C229 26.21%, #FFE391 61.51%, #FFBE00 104.18%)',
  			'text-gradient': 'linear-gradient(180deg, #4992FF 7.35%, #2C5899 138.24%)',
  			'color-gradient': 'linear-gradient(104.96deg, #E4EFFF 0%, #5C96ED 100%)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  important: true,
  variants: {
    extend: {},
  },
  plugins: [require('flowbite/plugin'), require("tailwindcss-animate")],
};
