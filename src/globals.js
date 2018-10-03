export const STATES = {
  PLACING: 0,
  RUNNING: 1
}
export const debug = false;

export const tileHeight = 5;
export const tileWidth = 10;
export const tileDepth = 5;
export const wallWidth = 5;
export const nTilesH = 11;
export const nTilesV = 28;

const PLANE_WIDTH = (nTilesH * tileWidth);
const PLANE_HEIGHT = 45;
const START_POSITION_Y = (-(nTilesV * tileHeight) / 2) + PLANE_HEIGHT / 2;

export const BALL_LIMITS = {
  limit_y_top: START_POSITION_Y + (PLANE_HEIGHT / 2),
  limit_y_bot: START_POSITION_Y - (PLANE_HEIGHT / 2),
  limit_x_left: -PLANE_WIDTH / 2,
  limit_x_right: PLANE_WIDTH / 2,
}

export function validateBallConfiguration(ballPosition, ballDirection) {
  if (ballDirection.z !== 0) {
    return 'direction.z should always be 0';
  }
  if (ballPosition.z !== 0) {
    return 'position.z should always be 0';
  }

  if (ballPosition.x < BALL_LIMITS.limit_x_left) {
    return 'ball exceeds limit to the left';
  }
  if (ballPosition.x > BALL_LIMITS.limit_x_right) {
    return 'ball exceeds limit to the right';
  }
  if (ballPosition.y > BALL_LIMITS.limit_y_top) {
    return 'ball exceeds limit to the top';
  }
  if (ballPosition.y < BALL_LIMITS.limit_y_bot) {
    return 'ball exceeds limit to the bottom';
  }

  return null;
}