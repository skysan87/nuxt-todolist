import moment from 'moment'

/**
 * 日付を数値型で取得
 * @returns {Number} 日付（YYYYMMDD)
 */
export function getDateNumber (_momoent = null) {
  const _m = _momoent || moment()
  return parseInt(_m.format('YYYYMMDD'))
}
