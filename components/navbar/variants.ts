export const topVariants = {
  closed: {
    rotate: 0,
    backgroundColor: '#ffffff'
  },
  opened: {
    rotate: 45,
    backgroundColor: '#000000'
  }
}

export const centerVariants = {
  closed: {
    opacity: 1
  },
  opened: {
    opacity: 0
  }
}

export const bottomVariants = {
  closed: {
    rotate: 0,
    backgroundColor: '#ffffff'
  },
  opened: {
    rotate: -45,
    backgroundColor: '#000000'
  }
}

export const listVariants = {
  closed: {
    x: '100vw'
  },
  opened: {
    x: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.2
    }
  }
}

export const listItemVariants = {
  closed: {
    x: -10,
    opacity: 0
  },
  opened: {
    x: 0,
    opacity: 1
  }
}
