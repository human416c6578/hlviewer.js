import { stylesheet } from 'typestyle'

const rootStyle = () => ({
  position: 'relative' as 'relative',
  color: 'white',
  width: '100%',
  height: '100%',
  cursor: 'none',
  userSelect: 'none' as 'none'
})

const titleStyle = () => ({
  position: 'absolute' as 'absolute',
  top: '20px',
  left: '0',
  zIndex: 20,
  padding: '10px 10px 10px 20px',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  fontSize: '13pt',
  fontFamily: `'Roboto', Arial, Helvetica, sans-serif`,
  opacity: 0,
  transition: 'opacity 0.2s'
})

const controlsStyle = () => ({
  zIndex: 30,
  position: 'absolute' as 'absolute',
  width: '100%',
  bottom: 0,
  padding: '0 16px',
  boxSizing: 'border-box' as 'border-box',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  userSelect: 'none' as 'none',
  opacity: 0,
  transition: 'opacity 0.2s'
})

export const RootStyle = stylesheet({
  root: {
    ...rootStyle()
  },
  rootVisible: {
    ...rootStyle(),
    cursor: 'default'
  },

  title: {
    ...titleStyle()
  },
  titleVisible: {
    ...titleStyle(),
    opacity: 1
  },

  keysVisible: {
    pointerEvents: 'none',
    position: 'absolute' as 'absolute',
    top: '70%',
    left: '50%',
    zIndex: 20,
    color: 'rgba(50, 130, 255, 1.0)',
    fontSize: '12pt',
    fontWeight: 'bold',
    fontFamily: `'Roboto', Arial, Helvetica, sans-serif`,
    opacity: 1,
    transition: 'opacity 0.2s',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },

  modelVisible: {
    pointerEvents: 'none',
    position: 'absolute' as 'absolute',
    left: '50%',
    bottom: 0,
    width: '65%',
    zIndex: 11,
    opacity: 1,
    transform: 'translate(-50%, 0%)',
  },


  controls: {
    ...controlsStyle()
  },
  controlsVisible: {
    ...controlsStyle(),
    opacity: 1
  },

  screen: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10
  }
})
