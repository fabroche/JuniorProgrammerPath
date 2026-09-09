using System.Collections.Generic;
using UnityEngine;

namespace Pools
{
    public class ObjectPool : MonoBehaviour
    {
        [SerializeField] private int initPoolSize;
        [SerializeField] private PooledObject objectToPoolPrefab;

        private Stack<PooledObject> _pool;

        // virtual para que un spawner pueda extenderlo: el override tiene que llamar a base.Start()
        protected virtual void Start()
        {
            SetupPool();
        }

        private void SetupPool()
        {
            _pool = new Stack<PooledObject>();
            PooledObject instance = null;

            for (int i = 0; i < initPoolSize; i++)
            {
                instance = Instantiate(objectToPoolPrefab);
                instance.Pool = this;
                instance.gameObject.SetActive(false);
                _pool.Push(instance);
            }
        }

        public PooledObject GetPooledObject()
        {
            if (IsPoolEmpty())
            {
                return InstantiateExtraObject();
            }

            PooledObject nextInstance = _pool.Pop();
            nextInstance.gameObject.SetActive(true);
            return nextInstance;
        }

        public void ReturnToPool(PooledObject objectToReturn)
        {
            objectToReturn.gameObject.SetActive(false);
            _pool.Push(objectToReturn);
        }
    
        private PooledObject InstantiateExtraObject()
        {
            PooledObject newInstance = Instantiate(objectToPoolPrefab);
            newInstance.Pool = this;
            return newInstance;
        }

        private bool IsPoolEmpty()
        {
            return _pool.Count == 0;
        }
    }
}