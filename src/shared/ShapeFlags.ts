export const enum ShapeFlags {
  ELEMENT = 0b0001,
  STATEFUL_COMPONENT = 0b0010,
  TEXT_CHILDREN = 0b0100,
  ARRAY_CHLDREN = 0b1000,
}

export type ShapeFlag = number
