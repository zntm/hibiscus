import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js'
import { createCanvas } from '@napi-rs/canvas'
import { join } from 'path'

import { IClient } from '../index.ts'
import { HEX2RGB, HSV2HEX, HSV2RGB, RGB2HEX, RGB2HSV, RGB2HSL, RGB2CMYK } from '../class/colorsys.ts'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

const enum CanvasSize {
	Width  = 360,
	Height = 24,

	WidthHalf    = Width / 2,
	HeightDouble = Height * 2
}

const colors = (await Bun.file(join(__dirname, '../resources/color.dic')).text())
	.replaceAll('\r', '')
	.split('\n')
	.map((i: string) => {
		const [ name, color ]: any = i.split(',');
		const decimal = parseInt(color, 16);

		return {
			name,
			r: (decimal >>  0) & 0xff,
			g: (decimal >>  8) & 0xff,
			b: (decimal >> 16) & 0xff
		}
	});

const nearestColor = (r: number, g: number, b: number): string => {
	let name = '';
	let minDistance = ((255 ** 2) * 3) + 1;

	colors.forEach(({ name: currentName, r: currentR, g: currentG, b: currentB }) => {
		const distance =
			((r - currentR) ** 2) +
			((g - currentG) ** 2) +
			((b - currentB) ** 2);
		
		if (minDistance > distance)
		{
			name = currentName;
			minDistance = distance;
		}
	});

	return name;
}

const canvasThumbnail  = createCanvas(32, 32);
const contextThumbnail = canvasThumbnail.getContext('2d');

const canvasColors  = createCanvas(CanvasSize.Width, CanvasSize.Height * 4);
const contextColors = canvasColors.getContext('2d');

const gradient = (x0: number, y0: number, x1: number, y1: number, fromColor: string, toColor: string, fillRectY: number, fillRectW: number, fillRectH: number) => {
	const gradient = contextColors.createLinearGradient(x0, y0, x1, y1);

	gradient.addColorStop(0, fromColor);
	gradient.addColorStop(1, toColor);
	
	contextColors.fillStyle = gradient;
	contextColors.fillRect(x0, fillRectY, fillRectW, fillRectH);
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
	await interaction.deferReply();

	const subcommand = interaction.options.getSubcommand();

	let hex: string = '';
	let rgb: {
		r: number,
		g: number,
		b: number
	} | null = null;

	if (subcommand === 'hex')
	{
		hex = (interaction.options.getString('hex') ?? '')
			.toLowerCase()
			.padStart(7, '#');

		if (isNaN(parseInt(hex.replace('#', ''), 16)))
		{
			return client.utils.interactionWarning(interaction, `${hex} isn't a valid hex code!`);
		}

		rgb = HEX2RGB(hex);
	}
	else if (subcommand === 'rgb')
	{
		const r = interaction.options.getInteger('red')   ?? 0;
		const g = interaction.options.getInteger('green') ?? 0;
		const b = interaction.options.getInteger('blue')  ?? 0;

		hex = RGB2HEX(r, g, b);
		rgb = { r, g, b };
	}
	else if (subcommand === 'hsv')
	{
		const h = interaction.options.getInteger('hue')        ?? 0;
		const s = interaction.options.getInteger('saturation') ?? 0;
		const v = interaction.options.getInteger('value')	   ?? 0;

		hex = HSV2HEX(h, s, v);
		rgb = HSV2RGB(h, s, v);
	}

	// @ts-ignore
	const { r, g, b } = rgb;
	const { h, s, v } = RGB2HSV(r, g, b);

	for (let i = 0; i < CanvasSize.Width; ++i)
	{
		contextColors.fillStyle = HSV2HEX(h + i, s, v);
		contextColors.fillRect(i, 0, 1, CanvasSize.Height);
	}

	const average = Math.round((r + g + b) / 3);
	
	gradient(0, 0, CanvasSize.Width, CanvasSize.Height, (RGB2HEX(average, average, average)), hex, CanvasSize.Height, CanvasSize.Width, CanvasSize.Height);
	gradient(0, 0, CanvasSize.WidthHalf, CanvasSize.Height, '#000000', hex, CanvasSize.HeightDouble, CanvasSize.WidthHalf, CanvasSize.Height);
	gradient(CanvasSize.WidthHalf, 0, CanvasSize.Width, CanvasSize.Height, hex, '#ffffff', CanvasSize.HeightDouble, CanvasSize.WidthHalf, CanvasSize.Height);
	gradient(0, 0, CanvasSize.Width, CanvasSize.Height, hex, RGB2HEX(Math.abs(r - 255), Math.abs(g - 255), Math.abs(b - 255)), CanvasSize.Height * 3, CanvasSize.Width, CanvasSize.Height);
	
	contextThumbnail.fillStyle = hex;
	contextThumbnail.fillRect(0, 0, 32, 32);

	const cmyk = RGB2CMYK(r, g, b);
	const hsl  = RGB2HSL(r, g, b);
	const decimal = (b << 16) | (g << 8) | r;

    const embed = client.utils.embedBuilder('Color', '🎨', (r << 16) | (g << 8) | b)
		.setThumbnail(`attachment://thumbnail.png`)
		.setDescription(
			// @ts-ignore
			`Closest Name 〃 ${nearestColor(decimal)}\n` +
			`Hex 〃 ${hex.toUpperCase()}\n` +
			`RGB 〃 ${r}, ${g}, ${b}\n` +
			`HSV 〃 ${h}, ${s}, ${v}\n` +
			`HSL 〃 ${hsl.h}, ${hsl.s}%, ${hsl.l}%\n` +
			`CMYK 〃 ${Math.round(cmyk.c * 10000) / 100}, ${Math.round(cmyk.m * 10000) / 100}, ${Math.round(cmyk.y * 10000) / 100}, ${Math.round(cmyk.k * 10000) / 100}\n` +
			`Decimal 〃 ${decimal}`
		)
		.setImage(`attachment://colors.png`)
		.setFooter({ text: 'The image above shows hue, saturation, brightness and inverted version in order.' });

	interaction.editReply({
		embeds: [ embed ],
		files: [
			new AttachmentBuilder(await canvasThumbnail.encode('png'))
				.setName('thumbnail.png'),
			new AttachmentBuilder(await canvasColors.encode('png'))
				.setName('colors.png')
		]
	});
}

export const metadata = new CommandMetadata(CommandCategory.Utility, new SlashCommandBuilder()
	.setName('color')
	.setDescription('Show general information about a color')
	.addSubcommand(new SlashCommandSubcommandBuilder()
		.setName('hex')
		.setDescription('Get the color information of a hex code')
		.addStringOption(new SlashCommandStringOption()
			.setName('hex')
			.setDescription('Set the hex code of the color')
			.setMinLength(3)
			.setMaxLength(7)
			.setRequired(true)))
	.addSubcommand(new SlashCommandSubcommandBuilder()
		.setName('rgb')
		.setDescription('Get the color information of an RGB value')
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('red')
			.setDescription('Set the red value of the color')
			.setMinValue(0)
			.setMaxValue(255)
			.setRequired(true))
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('green')
			.setDescription('Set the green value of the color')
			.setMinValue(0)
			.setMaxValue(255)
			.setRequired(true))
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('blue')
			.setDescription('Set the blue value of the color')
			.setMinValue(0)
			.setMaxValue(255)
			.setRequired(true)))
	.addSubcommand(new SlashCommandSubcommandBuilder()
		.setName('hsv')
		.setDescription('Get the color information of an HSV value')
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('hue')
			.setDescription('Set the hue of the color')
			.setMinValue(0)
			.setMaxValue(360)
			.setRequired(true))
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('saturation')
			.setDescription('Set the saturation of the color')
			.setMinValue(0)
			.setMaxValue(100)
			.setRequired(true))
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('value')
			.setDescription('Set the value of the color')
			.setMinValue(0)
			.setMaxValue(100)
			.setRequired(true))));