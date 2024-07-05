import matplotlib.pyplot as plt
import matplotlib.image as mpimg

# Load the image
img = mpimg.imread('map.png')

# Create a figure and axis
fig, ax = plt.subplots()

# Set the x and y range
ax.set_xlim(-400, 400)
ax.set_ylim(-400, 400)

# Display the image
extent = [-400, 400, -400, 400]
ax.imshow(img, extent=extent, aspect='auto')

# Highlight the center using a marker
ax.scatter([0], [0], color='red', marker='o', s=100)

# Create the grid lines
ax.set_xticks(range(-400, 401, 100))
ax.set_yticks(range(-400, 401, 100))
ax.grid(True)

# Show the plot
plt.gca().invert_yaxis()  # Invert y axis to match the image origin
plt.show()
