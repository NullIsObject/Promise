class Promise {
	constructor(executor) {
		const that = this

		//初始化状态和结果
		that.PromiseState = 'pending'
		that.PromiseResult = null

		//存储异步时的resolve和reject
		that.callbacks = []

		function resolve(data) {
			//修改状态为成功
			if (that.PromiseState !== "pending") return 0
			that.PromiseState = "fulfilled"
			that.PromiseResult = data
			for (const callback of that.callbacks) {
				callback()
			}
		}

		function reject(data) {
			//修改状态为失败
			if (that.PromiseState !== "pending") return 0
			that.PromiseState = "rejeted"
			that.PromiseResult = data
			for (const callback of that.callbacks) {
				callback()
			}
		}

		try {
			//调用传入的函数回调
			executor(resolve, reject)
		} catch (error) {
			//报错直接调用reject
			reject(error)
		}
	}

	then(onResolve = value => value, onReject = value => { throw value }) {
		//当需要执行onResolve，而用户又没有传入onResolve时，
		//直接将参数返回，此时then会返回一个成功的Promise对象
		//成功的结果为返回的参数。
		//当需要执行onReject，而用户又没有传入onReject时，
		//Promise会报错从而返回失败的Promise对象，
		//直到找到onReject为止。
		const that = this
		return new Promise((resolve, reject) => {
			function callback() {
				let result
				try {
					if (that.PromiseState === "fulfilled") {
						result = onResolve(that.PromiseResult)
					} else if (onReject && that.PromiseState === "rejeted") {
						result = onReject(that.PromiseResult)
					}
					if (result instanceof Promise) {
						result.then(value => {
							resolve(value)
						}, value => {
							reject(value)
						})
					} else {
						resolve(result)
					}
				} catch (error) {
					reject(error)
				}
			}

			//如果Promise传入的方法是同步的，那么会先修改状态再执行then方法，
			//此时callback可以直接执行
			if (that.PromiseState !== "pending") {
				//then在任何情况下都是异步执行
				setTimeout(callback)
			}
			//否则状态无法确定，需要先将callback保存，等待状态
			else that.callbacks.push(callback)
		})

	}

	catch(onReject) {
		return this.then(undefined, onReject)
	}

	static resolve(value) {
		if (value instanceof Promise) {
			return value
		} else {
			return new Promise((resolve) => {
				resolve(value)
			})
		}
	}

	static reject(reason) {
		return new Promise((_, reject) => {
			reject(reason)
		})
	}

	static all(iterable) {
		let resolveCount = 0
		let resultArray = []
		return new Promise((resolve, reject) => {
			if (iterable.length === 0) {
				resolve(resultArray)
			}
			iterable.forEach(val => {
				if (!val instanceof Promise) {
					resolveCount++
					resultArray.push(val)
					return 0;
				}
				val.then((result) => {
					resolveCount++
					resultArray.push(result)
					if (resolveCount === iterable.length) resolve()
				}, (error) => {
					reject(error)
				})
			});
		})
	}

	static rece(iterable) {
		return new Promise((resolve, reject) => {
			iterable.forEach(val => {
				val.then((value) => {
					resolve(value)
				}, (error) => {
					reject(error)
				})
			})
		})
	}
}

export default Promise