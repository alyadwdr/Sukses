import { useTheme } from '@/context/ThemeContext'

const LIGHT_DONUT = ['#95B1EE', '#E7F1A8', '#364C84', '#B9CDF3', '#F0F6C8', '#6D89C4', '#D5E28E', '#28345C', '#AFC6F0', '#8FA9DE']
const DARK_DONUT = ['#9BB6EF', '#CBD98C', '#5C7BBE', '#B9CDF3', '#E2ECB8', '#7C9AD4', '#A9BC72', '#4E6BAC', '#8FA9DE', '#6E8AC4']

export function useChartColors() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return {
    sales: dark ? '#9BB6EF' : '#95B1EE',
    expenses: dark ? '#5C7BBE' : '#364C84',
    donut: dark ? DARK_DONUT : LIGHT_DONUT,
  }
}