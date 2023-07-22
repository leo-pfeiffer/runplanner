export const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
}

export const formatDateAndTime = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'})
}