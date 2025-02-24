import { Context, Schema } from 'koishi'

export const name = 'audiobook-lizard'
export const inject = ['database'];

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

interface Audiobooks {
  userId: string
  albumId: number
  trackId: number
}

declare module 'koishi' {
  interface Tables {
    Audiobooks: Audiobooks;
  }
}

export function apply(ctx: Context) {


  ctx.model.extend('Audiobooks', {
    userId: 'string',
    albumId: 'unsigned',
    trackId: 'unsigned',
  })








}