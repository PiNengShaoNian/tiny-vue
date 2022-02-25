export const enum ShapeFlags {
  ELEMENT /*            */ = 0b00001,
  STATEFUL_COMPONENT /* */ = 0b00010,
  TEXT_CHILDREN /*      */ = 0b00100,
  ARRAY_CHLDREN /*      */ = 0b01000,
  SLOT_CHILDREN /*      */ = 0b10000,
}

export type ShapeFlag = number
