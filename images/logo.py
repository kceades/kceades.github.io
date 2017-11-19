
"""
Code for my websites' logo

Written by Kevin Caleb Eades
"""

# imports
import numpy as np
import numpy.random as rand
import matplotlib.image as im


class logomaker(object):
	""" class for creating a logo """
	def __init__(self):
		""" constructor """
		self.rows = 128
		self.cols = 128
		self.arr = np.zeros((self.rows,self.cols,4),'uint8')
	
	def MakeLogo(self):
		self.max_r = self.rows/2
		for row in range(self.rows):
			for col in range(self.cols):
				r = np.sqrt((row-self.rows/2)**2+(col-self.cols/2)**2)
				if r<self.max_r:
					self.arr[row][col][1:3] = 255*col/self.cols
					self.arr[row][col][3] = 255
		for i in range(3):
			self.RandomWalk(i)

	def RandomWalk(self,rgb_val):
		""" do random walks with various probabilities depending on color """
		row = int(self.rows/2)
		for col in range(self.cols):
			for wide_row in range(row-1,row+2):
				self.arr[wide_row][col][:3] = 0
				self.arr[wide_row][col][rgb_val] = 255
			if rand.random()>(0.7-0.4*rgb_val/2) and row<(self.rows-2):
				row = row + 1
			else:
				if row>1:
					row = row - 1

	def Save(self,name):
		""" Saves the image """
		im.imsave(name,self.arr)

if __name__=='__main__':
	x = logomaker()
	x.MakeLogo()
	x.Save('logo.png')